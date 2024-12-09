import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { invalidateSession } from "$lib/server/auth";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import { mockSuggestion } from "$lib/mockData";
import { table } from "$lib";

export const load = (async ({ locals: { session, user } }) => {
	if (!session) redirect(302, "/login");

	return { user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ locals: { session }, cookies }) => {
		if (session) {
			invalidateSession(session.id);
			cookies.delete(auth.sessionCookieName, { path: "/" });
		}
		redirect(302, "/");
	},
	add: async () => {
		await db.insert(table.suggestion).values(await mockSuggestion());
	},
};
