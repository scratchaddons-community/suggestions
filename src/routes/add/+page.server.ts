import { maxImages, toSentenceCase } from "$lib";
import { table } from "$lib/server";
import { db } from "$lib/server/db";
import { tag, type Image } from "$lib/server/db/schema";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { cloudinary } from "$lib/cloudinary/interact";

export const load = (async ({ locals: { session } }) => {
	if (!session) redirect(302, "/login");

	return { tags: tag.enumValues };
}) satisfies PageServerLoad;

export const actions: Actions = {
	suggestion: async ({ request, locals: { user }, fetch: sveltekitFetch }) => {
		if (!user) return { status: 401 };

		const formData = await request.formData();
		const formTag = formData.get("tag");
		const formTitle = formData.get("title");
		const formDescription = formData.get("description");
		const formImages: App.Image[] | undefined = JSON.parse(formData.get("images") as string);

		if (!(formTag || formTitle || formDescription)) return { status: 400 };

		const parsedTag = (
			JSON.parse(formTag as string) as { value: (typeof tag.enumValues)[number]; label: string }
		).value;

		const imageIds: string[] = [];

		if (formImages) {
			if (formImages?.length > maxImages)
				return fail(400, { message: `You can only upload ${maxImages} images` });

			try {
				await Promise.all(
					formImages.map(async (image) => {
						const response = await sveltekitFetch("/api/image/moderation", {
							method: "POST",
							body: JSON.stringify({ imageUrl: image.url }),
						});

						const moderationResponse: App.ModerationResult = await response.json();

						const results = moderationResponse.data.analysis.responses.map(
							(response) => response.value,
						);
						const nsfw = results.includes("yes");

						if (nsfw) {
							await cloudinary.delete(image.cloudinaryId || "", image.id, sveltekitFetch);
							// Strike user for being an idiot
							// THAT WAS THE AUTO COMPLETE WHAT 😂😂😂😂😂
							throw new Error("Image has been flagged as NSFW");
						}

						const id = crypto.randomUUID();
						imageIds.push(id);

						await db.insert(table.image).values({
							id,
							url: image.url,
							resolution: {
								x: image.dimensions?.width,
								y: image.dimensions?.height,
							},
							cloudinaryId: image.cloudinaryId,
						} as Image);
						// Why. Why. Why.
					}),
				);
			} catch (error) {
				return fail(500, { message: (error as Error).message });
			}
		}

		await db.insert(table.suggestion).values({
			id: crypto.randomUUID(),
			authorId: user?.id,
			title: toSentenceCase(formTitle as string | null),
			createdAt: new Date(Date.now()),
			description: toSentenceCase(formDescription as string | null),
			tag: parsedTag,
			imageIds,
		});

		return { status: 200, message: "Suggestion added" };
	},
};
