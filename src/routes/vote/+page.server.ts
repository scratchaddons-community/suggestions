import { table } from "$lib";
import { db } from "$lib/server/db";
import type { Actions } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const actions: Actions = {
	vote: async ({ locals: { session }, request }) => {
		const data = await request.formData();
		const suggestionId = data.get("suggestionId") as string;
		console.log("🚀 ~ vote: ~ suggestionId:", suggestionId);

		const voterIds = (
			await db
				.select({ voterIds: table.suggestion.voterIds })
				.from(table.suggestion)
				.where(eq(table.suggestion.id, suggestionId))
		).map((row) => row.voterIds)[0];

		if (session && voterIds) {
			const userId = session.userId;
			if (voterIds.includes(userId)) {
				await db
					.update(table.suggestion)
					.set({ voterIds: voterIds.filter((id) => id !== userId) })
					.where(eq(table.suggestion.id, suggestionId));
			} else {
				await db
					.update(table.suggestion)
					.set({ voterIds: [...voterIds, userId] })
					.where(eq(table.suggestion.id, suggestionId));
			}
		}

		// Find out how to rerender the suggestion so that the vote count is updated
	},
};
