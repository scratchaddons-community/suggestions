import { toSentenceCase } from "$lib";
import { table } from "$lib/server";
import { db } from "$lib/server/db";
import { tag } from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

interface CloudinaryUploadResponse {
	id: string;
	batchId: string;
	asset_id: string;
	public_id: string;
	version: number;
	version_id: string;
	signature: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	created_at: string;
	tags: string[];
	bytes: number;
	type: string;
	etag: string;
	placeholder: boolean;
	url: string;
	secure_url: string;
	asset_folder: string;
	display_name: string;
	existing: boolean;
	original_filename: string;
	path: string;
	thumbnail_url: string;
}

export const load = (async ({ locals: { session } }) => {
	if (!session) throw redirect(302, "/login");
	return { tags: tag.enumValues };
}) satisfies PageServerLoad;

export const actions: Actions = {
	suggestion: async ({ request, locals: { user } }) => {
		if (!user) {
			return { status: 401 };
		}

		const formData = await request.formData();
		const formTag = formData.get("tag");
		const formTitle = formData.get("title");
		const formDescription = formData.get("description");
		const formImageDatas = formData.get("imageDatas");

		if (!formTag && !formTitle && !formDescription) {
			return { status: 400 };
		}

		const parsedTag = (
			JSON.parse(formTag as string) as { value: (typeof tag.enumValues)[number]; label: string }
		).value;

		const imageIds: string[] = [];
		if (formImageDatas) {
			const imageDatas: CloudinaryUploadResponse[] = JSON.parse(formImageDatas.toString());

			try {
				await Promise.all(
					imageDatas.map(async (imageData) => {
						const imageId = crypto.randomUUID();
						await db.insert(table.image).values({
							id: imageId,
							url: imageData.url,
							resolution: { x: imageData.width, y: imageData.height },
						});
						imageIds.push(imageId);
					}),
				);
			} catch (e) {
				console.error("Error uploading images:", e);
				throw error(500, { message: e instanceof Error ? e.message : "Error uploading images" });
			}
		}

		try {
			await db.insert(table.suggestion).values({
				id: crypto.randomUUID(),
				authorId: user.id,
				title: toSentenceCase(formTitle as string | null),
				createdAt: new Date(),
				description: toSentenceCase(formDescription as string | null),
				tag: parsedTag,
				imageIds,
			});

			return { status: 200 };
		} catch (e) {
			console.error("Error creating suggestion:", e);
			throw error(500, { message: e instanceof Error ? e.message : "Error creating suggestion" });
		}
	},
};
