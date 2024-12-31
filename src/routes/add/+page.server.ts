import { sleep, toSentenceCase } from "$lib";
import { table } from "$lib/server";
import { db } from "$lib/server/db";
import { tag } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals: { session } }) => {
	if (!session) redirect(302, "/login");

	return { tags: tag.enumValues };
}) satisfies PageServerLoad;

export const actions: Actions = {
	suggestion: async ({ request, locals: { user } }) => {
		if (!user) return { status: 401 };

		const formData = await request.formData();
		const formTag = formData.get("tag");
		const formTitle = formData.get("title");
		const formDescription = formData.get("description");

		if (!(formTag || formTitle || formDescription)) return { status: 400 };

		const parsedTag = (
			JSON.parse(formTag as string) as { value: (typeof tag.enumValues)[number]; label: string }
		).value;

		await sleep(1000);

		await db.insert(table.suggestion).values({
			id: crypto.randomUUID(),
			authorId: user?.id,
			title: toSentenceCase(formTitle as string | null),
			createdAt: new Date(Date.now()),
			description: toSentenceCase(formDescription as string | null),
			tag: parsedTag,
		});

	},
};
