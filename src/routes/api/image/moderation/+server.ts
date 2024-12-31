import { CLOUDINARY_SECRET } from "$env/static/private";
import { PUBLIC_CLOUDINARY_KEY, PUBLIC_CLOUDINARY_NAME } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const { imageUrl }: { imageUrl: string } = await request.json();

	const requestBody = {
		source: {
			uri: imageUrl,
		},
		rejection_questions: ["Does the image contain any NSFW content of any kind?"],
	};

	const moderationRequest = new Request(
		`https://api.cloudinary.com/v2/analysis/${PUBLIC_CLOUDINARY_NAME}/analyze/ai_vision_moderation`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Basic " + btoa(`${PUBLIC_CLOUDINARY_KEY}:${CLOUDINARY_SECRET}`),
			},
			body: JSON.stringify(requestBody),
		},
	);

	const moderationResponse = await fetch(moderationRequest);
	const result: App.ModerationResult = await moderationResponse.json();

	console.log(result.data.analysis);

	return new Response(JSON.stringify({ ...result }), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
