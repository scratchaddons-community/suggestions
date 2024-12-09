import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { invalidateSession } from "$lib/server/auth";
import * as auth from "$lib/server/auth";

export const load = (async ({ locals: { session, user } }) => {
	if (!session) redirect(302, "/");

	return { user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals: { session }, cookies }) => {
		if (session) {
			invalidateSession(session.id);
			cookies.delete(auth.sessionCookieName, { path: "/" });
		}
		redirect(302, "/");
	},
};
