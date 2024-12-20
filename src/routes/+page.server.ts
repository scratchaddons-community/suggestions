import { table } from "$lib/server";
import { db } from "$lib/server/db";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { fail, type Actions } from "@sveltejs/kit";
import Bottleneck from "bottleneck";

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

const getCountFromDb = async (
	filter?: Parameters<typeof getPage>[2],
	search?: Parameters<typeof getPage>[3],
) => {
	let filterBy: SQL | undefined = undefined;

	filterBy = getFilterBy(filter, search);

	return await db
		.select({ count: count() })
		.from(table.suggestion)
		.leftJoin(table.user, eq(table.suggestion.authorId, table.user.id))
		.where(filterBy);
};

const getSuggestionsFromDb = async (
	page: number,
	sort: Parameters<typeof getPage>[1],
	filter?: Parameters<typeof getPage>[2],
	search?: string,
) => {
	return await getPage(page, sort, filter, search);
};

const handleCountResponse = async (countObj: { count: number }[]) => {
	const { count } = countObj[0];
	return count || 0;
};

export const load = (async ({ url }) => {
	const page = +(url.searchParams.get("page") || 1);
	if (typeof page !== "number" || Number.isNaN(page))
		return { status: 400, message: "Invalid page number" };

	const getSuggestionsForLoad = (async () => {
		return await getSuggestionsFromDb(page, "trending");
	})();

	const getImages = (async () => {
		return await db.select().from(table.image);
	})();

	const getCount = (async () => {
		return await getCountFromDb();
	})();

	return {
		getSuggestions: getSuggestionsForLoad,
		getImages,
		count: await getCount.then(handleCountResponse),
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
					const updatedVoterIds = existingVote.voterIds.includes(userId)
						? existingVote.voterIds.filter((id) => id !== userId)
						: [...existingVote.voterIds, userId];

					await db
						.update(table.suggestion)
						.set({ voterIds: updatedVoterIds })
						.where(eq(table.suggestion.id, suggestionId));

					const count = updatedVoterIds.length;
					return { count, action: existingVote.voterIds.includes(userId) ? "remove" : "add" };
				}

				return { status: 404 };
			});
		} catch (error) {
			console.error(error);
			return fail(500);
		}
	},

	next: async ({ request }) => getSuggestions(request, 1),

	prev: async ({ request }) => getSuggestions(request, -1),

	sort: async ({ request }) => getSuggestions(request, 0),

	filter: async ({ request }) => getSuggestions(request, 0),

	search: async ({ request }) => getSuggestions(request, 0),
};

async function getSuggestions(request: Request, pageOffset: number) {
	const data = await request.formData();
	let page = +(data.get("page") || 0) + pageOffset;
	const filter = JSON.parse(data.get("filter") as string)?.value;
	const sort = JSON.parse(data.get("sort") as string)?.value as Parameters<typeof getPage>[1];
	const search = data.get("search") as string;

	const countResult = await getCountFromDb(filter, search);
	const count = await handleCountResponse(countResult);
	const numPages = Math.ceil((count || 10) / 10);
	page = page > numPages ? 1 : page;

	const suggestions = await getSuggestionsFromDb(page, sort, filter, search);
	return {
		page,
		filter,
		sort,
		suggestions,
		search,
		count,
	};
}

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

	filterBy = getFilterBy(filter, search);

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

function getFilterBy(filter: Parameters<typeof getPage>[2], search: string | undefined) {
	if (filter && filter !== "all") {
		if (search) return and(eq(table.suggestion.status, filter), getSearchFilterBy(search));

		return eq(table.suggestion.status, filter);
	} else if (search) {
		return getSearchFilterBy(search);
	}
}

function getSearchFilterBy(search: string | undefined) {
	if (search) {
		return or(
			ilike(table.suggestion.title, `%${search}%`),
			ilike(table.suggestion.description, `%${search}%`),
			ilike(table.user.username, `%${search}%`),
			ilike(table.user.displayName, `%${search}%`),
		);
	}
}
