import { table } from "$lib";
import { db } from "$lib/server/db";
import { desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	const query = (async () => {
		return await db.select().from(table.suggestion).orderBy(desc(table.suggestion.createdAt));
	})();

	return { suggestions: query };
}) satisfies PageServerLoad;
