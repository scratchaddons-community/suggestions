import { sleep, table } from "$lib";
import { db } from "$lib/server/db";
import { count, desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { fail, type Actions } from "@sveltejs/kit";
import Bottleneck from "bottleneck";
import { dev } from "$app/environment";

const limiter = new Bottleneck({
	maxConcurrent: 1,
	minTime: 20,
	reservoir: 10,
	reservoirRefreshInterval: 5000,
	reservoirRefreshAmount: 8,
	strategy: Bottleneck.strategy.LEAK,
});

export const load = (async ({ url }) => {
	const page = +(url.searchParams.get("page") || 1);
	if (typeof page !== "number" || Number.isNaN(page))
		return { status: 400, message: "Invalid page number" };

	const getSuggestions = (async () => {
		if (dev) await sleep(1000);

		return await db
			.select({
				suggestion: table.suggestion,
				user: {
					id: table.user.id,
					username: table.user.username,
					displayName: table.user.displayName,
				},
			})
			.from(table.suggestion)
			.orderBy(desc(table.suggestion.createdAt))
			.leftJoin(table.user, eq(table.suggestion.authorId, table.user.id))
			.limit(10)
			.offset(((page || 1) - 1) * 10);
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
		count: getCount.then(([countObj]) => {
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
			const reservoir = await limiter.currentReservoir();
			if (reservoir && reservoir < 2) {
				return fail(429);
			}

			return await limiter.schedule(async () => {
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
		const page = +(data.get("page") || 0) + 1;

		const suggestions = await getPage(page);

		return { page, suggestions };
	},

	prev: async ({ request }) => {
		const data = await request.formData();
		const page = +(data.get("page") || 0) - 1;

		const suggestions = await getPage(page);

		return { page, suggestions };
	},
};

async function getPage(page: number) {
	return await db
		.select({
			suggestion: table.suggestion,
			user: {
				id: table.user.id,
				username: table.user.username,
				displayName: table.user.displayName,
			},
		})
		.from(table.suggestion)
		.orderBy(desc(table.suggestion.createdAt))
		.leftJoin(table.user, eq(table.suggestion.authorId, table.user.id))
		.limit(10)
		.offset(((page || 1) - 1) * 10);
}
