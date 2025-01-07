import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import { mockImage, mockSuggestion } from "$lib/mockData";
import { table } from "$lib/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load = (async ({ locals: { user }, setHeaders, depends }) => {
	if (!user) redirect(302, "/login");

	setHeaders({
		"Cache-Control": "max-age=60",
	});

	// If we do not want to redirect to / (see the +page.svelte file), uncomment this line. Keeping this line is causes a flash to the
	// "Sign in" UI before navigating to the root page.
	// depends("session");

	return { user };
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async (event) => {
		const {
			locals: { session },
		} = event;

		if (!session) {
			return fail(401, { message: "Could not log out, no session found." });
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
