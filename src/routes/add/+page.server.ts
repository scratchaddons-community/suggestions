import { maxImages, toSentenceCase } from "$lib";
import { table } from "$lib/server";
import { db } from "$lib/server/db";
import { tag, type Image } from "$lib/server/db/schema";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { cloudinary } from "$lib/cloudinary/interact";

const disableNsfwCheck = true;

export const load = (async ({ locals: { session }, setHeaders }) => {
	if (!session) redirect(302, "/login");

	setHeaders({
		"Cache-Control": "max-age=3600",
	});

	return { tags: tag.enumValues };
}) satisfies PageServerLoad;

export const actions: Actions = {
	suggestion: async ({ request, locals: { user }, fetch: sveltekitFetch }) => {
		if (!user) return { status: 401 };

		const formData = await request.formData();
		const formTag = formData.get("tag");
		const formTitle = formData.get("title")?.toString();
		const formDescription = formData.get("description")?.toString();
		const formImages: App.Image[] | undefined = JSON.parse(formData.get("images") as string);

		if (!(formTag && formTitle && formDescription)) return { status: 400 };

		if (formTitle.length < 3 || formTitle.length > 100)
			return fail(400, { message: "Title too short or too long" });
		if (formDescription.length < 5 || formDescription.length > 1_000)
			return fail(400, { message: "Description too short or too long" });

		const parsedTag = (
			JSON.parse(formTag as string) as { value: (typeof tag.enumValues)[number]; label: string }
		).value;

		const imageIds: { cloudinaryId: string; id: string }[] = [];

		if (formImages) {
			if (formImages?.length > maxImages)
				return fail(400, { message: `You can only upload ${maxImages} images` });

			try {
				await Promise.all(
					formImages.map(async (image) => {
						if (image.error)
							throw new Error("Image did not upload properly, can not check for NSFW content");

						const response = await sveltekitFetch("/api/image/moderation", {
							method: "POST",
							body: JSON.stringify({ imageUrl: image.url }),
						});

						const moderationResponse: App.ModerationResult | App.ModerationError =
							await response.json();

						if ("error" in moderationResponse) {
							throw new Error(
								`Error checking for nsfw images: ${moderationResponse.error.message}, ${moderationResponse.error.details.message}`,
							);
						}

						const results = moderationResponse.data.analysis.responses.map(
							(response) => response.value,
						);
						const nsfw = results.includes("yes");

						if (nsfw && !disableNsfwCheck) {
							await cloudinary.delete(image.cloudinaryId || "", image.id, sveltekitFetch);
							// Strike user for being an idiot
							// THAT WAS THE AUTO COMPLETE WHAT 😂😂😂😂😂
							throw new Error("Image has been flagged as NSFW");
						}

						const id = crypto.randomUUID();
						imageIds.push({ cloudinaryId: id, id: image.id });

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

		if (formImages) {
			const formImageIds = formImages.map((img) => img.id);

			imageIds.sort((a, b) => formImageIds.indexOf(a.id) - formImageIds.indexOf(b.id));
		}

		await db.insert(table.suggestion).values({
			id: crypto.randomUUID(),
			authorId: user?.id,
			title: toSentenceCase(formTitle as string | null),
			createdAt: new Date(Date.now()),
			description: toSentenceCase(formDescription as string | null),
			tag: parsedTag,
			imageIds: imageIds.map((image) => image.cloudinaryId),
		});

		return { status: 200, message: "Suggestion added" };
	},
};
