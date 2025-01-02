import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import { mockImage, mockSuggestion } from "$lib/mockData";
import { table } from "$lib/server";

export const load = (async ({ locals: { user } }) => {
	if (!user) redirect(302, "/login");

	return { user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async (event) => {
		const {
			locals: { session },
		} = event;

		if (!session) {
			return fail(401);
		}
		await auth.invalidateSession(session.id);
		auth.deleteSessionTokenCookie(event);

		redirect(302, "/");
	},
	suggestion: async ({ locals: { session } }) => {
		await db.insert(table.suggestion).values(await mockSuggestion(session?.userId ?? ""));
	},
	image: async () => {
		await db.insert(table.image).values(await mockImage());
	},
};
