import { table } from "$lib";
import { db } from "$lib/server/db";
import { desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { fail, type Actions } from "@sveltejs/kit";
import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
	maxConcurrent: 1,
	minTime: 200,
	reservoir: 100,
	reservoirRefreshInterval: 1000 * 60,
	reservoirRefreshAmount: 60,
	strategy: Bottleneck.strategy.LEAK,
});

export const load = (async () => {
	const suggestions = db
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
		.limit(10);

	const images = db.select().from(table.image);

	return { suggestions, images };
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
			console.log("🚀 ~ vote: ~ reservoir:", reservoir);
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
};
