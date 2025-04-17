import { redis } from "$lib/server/redis";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
	await redis.set("keepalive", Date.now(), "EX", 60);
	return new Response(null, { status: 200 });
};
