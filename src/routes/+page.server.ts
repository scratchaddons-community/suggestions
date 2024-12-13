import { sleep, table } from "$lib";
import { db } from "$lib/server/db";
import { and, asc, count, desc, eq, ilike, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { fail, type Actions } from "@sveltejs/kit";
import Bottleneck from "bottleneck";
import { dev } from "$app/environment";
import type { SQL } from "drizzle-orm";

const voteLimiter = new Bottleneck({
	maxConcurrent: 1,
	minTime: 200,
	reservoir: 10,
	reservoirRefreshInterval: 5000,
	reservoirRefreshAmount: 8,
	strategy: Bottleneck.strategy.LEAK,
});

const pageLimiter = new Bottleneck({
	maxConcurrent: 1,
	minTime: 200,
	reservoir: 10,
	reservoirRefreshInterval: 10000,
	reservoirRefreshAmount: 20,
	strategy: Bottleneck.strategy.BLOCK,
	highWater: 1,
	penalty: 1000,
});

export const load = (async ({ url }) => {
	const page = +(url.searchParams.get("page") || 1);
	if (typeof page !== "number" || Number.isNaN(page))
		return { status: 400, message: "Invalid page number" };

	const getSuggestions = (async () => {
		if (dev) await sleep(1000);

		return await getPage(page);
	})();

	const getImages = (async () => {
		if (dev) await sleep(500);

		return await db.select().from(table.image);
	})();

	const getCount = (async () => {
		if (dev) await sleep(250);

		return await db.select({ count: count() }).from(table.suggestion);
	})();

	return {
		getSuggestions,
		getImages,
		count: await getCount.then(([countObj]) => {
			const { count } = countObj;
			return count || 0;
		}),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	vote: async ({ request, locals: { session } }) => {
		if (!session) return { status: 401 };

		const data = await request.formData();
		const suggestionId = data.get("suggestionId")?.toString();
		const userId = session.userId;

		if (!suggestionId) return { status: 400 };

		try {
			const reservoir = await voteLimiter.currentReservoir();
			if (reservoir && reservoir < 2) {
				return fail(429);
			}

			return await voteLimiter.schedule(async () => {
				const [existingVote] = await db
					.select({ voterIds: table.suggestion.voterIds })
					.from(table.suggestion)
					.where(eq(table.suggestion.id, suggestionId));

				if (existingVote.voterIds) {
					if (existingVote.voterIds.includes(userId)) {
						await db
							.update(table.suggestion)
							.set({ voterIds: existingVote.voterIds.filter((id) => id !== userId) })
							.where(eq(table.suggestion.id, suggestionId));
						const count = existingVote.voterIds.filter((id) => id !== userId).length;

						return { count, action: "remove" };
					} else {
						await db
							.update(table.suggestion)
							.set({ voterIds: [...existingVote.voterIds, userId] })
							.where(eq(table.suggestion.id, suggestionId));
						const count = existingVote.voterIds.length + 1;

						return { count, action: "add" };
					}
				}

				return { status: 404 };
			});
		} catch (error) {
			console.error(error);
			return fail(500);
		}
	},

	next: async ({ request }) => {
		const data = await request.formData();
		const filter = JSON.parse(data.get("filter") as string)?.value;
		const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];
		const page = +(data.get("page") || 0) + 1;

		const suggestions = await getPage(page, sort, filter);

		return { page, suggestions };
	},

	prev: async ({ request }) => {
		const data = await request.formData();
		const filter = JSON.parse(data.get("filter") as string)?.value;
		const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];
		const page = +(data.get("page") || 0) - 1;

		const suggestions = await getPage(page, sort, filter);

		return { page, suggestions };
	},

	sort: async ({ request }) => {
		const data = await request.formData();
		const filter = JSON.parse(data.get("filter") as string)?.value;
		const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];
		const page = +(data.get("page") || 0);

		const suggestions = await getPage(page, sort, filter);

		return { sort, page, suggestions };
	},

	filter: async ({ request }) => {
		const data = await request.formData();
		let page = +(data.get("page") || 0);
		const filter = JSON.parse(data.get("filter") as string)?.value;
		const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];

		const getCount = (async () => {
			let filterBy: SQL | undefined = undefined;
			if (filter && filter !== "all") filterBy = eq(table.suggestion.status, filter);

			return await db.select({ count: count() }).from(table.suggestion).where(filterBy);
		})();

		const thing = await getCount.then(([countObj]) => {
			const { count } = countObj;
			return count || 0;
		});

		const numPages = Math.ceil((thing || 10) / 10);
		page = page > numPages ? 1 : page;

		const suggestions = await getPage(page, sort, filter);

		return {
			page,
			filter,
			sort,
			suggestions,
			count: await getCount.then(([countObj]) => {
				const { count } = countObj;
				return count || 0;
			}),
		};
	},

	search: async ({ request }) => {
		const data = await request.formData();
		let page = +(data.get("page") || 0);
		const filter = JSON.parse(data.get("filter") as string)?.value;
		const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];
		const search = data.get("search") as string;

		const getCount = (async () => {
			let filterBy: SQL | undefined = undefined;
			if (filter && filter !== "all") {
				filterBy = eq(table.suggestion.status, filter);

				if (search) filterBy = and(filterBy, ilike(table.suggestion.title, search));
			} else if (search) {
				filterBy = ilike(table.suggestion.title, search);
			}
			return await db.select({ count: count() }).from(table.suggestion).where(filterBy);
		})();

		const thing = await getCount.then(([countObj]) => {
			const { count } = countObj;
			return count || 0;
		});

		const numPages = Math.ceil((thing || 10) / 10);
		page = page > numPages ? 1 : page;

		const suggestions = await getPage(page, sort, filter, search);

		return {
			page,
			filter,
			sort,
			suggestions,
			search,
			count: await getCount.then(([countObj]) => {
				const { count } = countObj;
				return count || 0;
			}),
		};
	},
};

async function getPage(
	page: number,
	sort: "trending" | "newest" | "oldest" | "most" | "least" = "trending",
	filter:
		| "pending"
		| "good"
		| "implemented"
		| "in-dev"
		| "incompatible"
		| "impractical"
		| "rejected"
		| "impossible"
		| "all"
		| undefined = undefined,
	search: string | undefined = undefined,
) {
	let sortBy: SQL;
	let filterBy: SQL | undefined = undefined;

	switch (sort) {
		default:
			sortBy = sql`
				array_length(${table.suggestion.voterIds}, 1) /
				POWER(((EXTRACT(EPOCH FROM NOW()) * 1000) - EXTRACT(EPOCH FROM ${table.suggestion.createdAt}) *1000) /
				(1000 * 60 * 60 * 24) + 1, 10) DESC
			`;
			break;
		case "newest":
			sortBy = desc(table.suggestion.createdAt);
			break;
		case "oldest":
			sortBy = asc(table.suggestion.createdAt);
			break;
		case "most":
			sortBy = sql`array_length(${table.suggestion.voterIds}, 1) DESC`;
			break;
		case "least":
			sortBy = sql`array_length(${table.suggestion.voterIds}, 1) ASC`;
			break;
	}

	if (filter && filter !== "all") {
		filterBy = eq(table.suggestion.status, filter);

		if (search) filterBy = and(filterBy, ilike(table.suggestion.title, `%${search}%`));
	} else if (search) {
		filterBy = ilike(table.suggestion.title, `%${search}%`);
	}

	return await pageLimiter.schedule(() => {
		return db
			.select({
				suggestion: table.suggestion,
				user: {
					id: table.user.id,
					username: table.user.username,
					displayName: table.user.displayName,
				},
			})
			.from(table.suggestion)
			.orderBy(sortBy, desc(table.suggestion.createdAt))
			.leftJoin(table.user, eq(table.suggestion.authorId, table.user.id))
			.limit(10)
			.offset(((page || 1) - 1) * 10)
			.where(filterBy);
	});
}
