import { redirect, type Actions } from "@sveltejs/kit";
import { generateState } from "arctic";
import { github } from "$lib/server/auth";
import { encodeBase64 } from "@oslojs/encoding";
import type { PageServerLoad } from "./$types";
import { OAUTH_CALLBACK_URL } from "$env/static/private";

export const load = (async ({ locals: { session }, setHeaders }) => {
	if (session) redirect(302, "/account");

	setHeaders({
		"Cache-Control": "max-age=3600",
	});
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	github: async ({ locals: { session } }) => {
		if (session) redirect(302, "/account");

		const state = generateState();
		const scopes = ["read:user"];
		const url = github.createAuthorizationURL(state, scopes);

		redirect(302, url);
	},
	scratch: async ({ locals: { session } }) => {
		if (session) redirect(302, "/account");

		const array = Uint8Array.from(
			Array.from(OAUTH_CALLBACK_URL).map((letter) => letter.charCodeAt(0)),
		);

		const redirectTo = encodeBase64(array);
		const authUrl = `https://auth.itinerary.eu.org/auth/?redirect=${redirectTo}&name=SA Suggestions`;
		redirect(302, authUrl);
	},
};
