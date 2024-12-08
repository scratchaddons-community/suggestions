import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { github } from "$lib/server/auth";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ url, cookies }) => {
	const searchParams = new URLSearchParams(url.search);
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	const privateCode = searchParams.get("privateCode");

	const oAuthProvider = privateCode ? "scratch" : "github";

	let oauthId;
	let username;
	let displayName;

	if (oAuthProvider === "github") {
		if (!code || !state) {
			redirect(307, "/auth/error");
		}

		const tokens = await github.validateAuthorizationCode(code);
		const accessToken = tokens.accessToken();

		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const githubUser = await response.json();

		if (!githubUser) redirect(307, "/auth/error");

		oauthId = githubUser.id;
		username = githubUser.login;
		displayName = githubUser.name;
	}

	if (oAuthProvider === "scratch") {
		await fetch(`https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=${privateCode}`, {
			method: "GET",
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("🚀 ~ .then ~ data:", data);

				if (data.valid === true && data.redirect === "http://localhost:5173/auth/callback/") {
					oauthId = data.username;
					username = data.username;
					displayName = "";
				} else {
					redirect(307, "/auth/error");
				}
			});
	}

	console.log({ oauthId, username, displayName });

	let [dbUser] = await db.select().from(table.user).where(eq(table.user.oauthId, oauthId));

	if (!dbUser) {
		await db.insert(table.user).values({
			id: crypto.randomUUID(),
			oauthId,
			username,
			displayName,
		});
	}

	[dbUser] = await db.select().from(table.user).where(eq(table.user.oauthId, oauthId));

	const session = await auth.createSession(dbUser.id);

	cookies.set(auth.sessionCookieName, session.id, { path: "/" });

	redirect(302, "/account");
};
