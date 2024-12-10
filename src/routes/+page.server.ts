import { table } from "$lib";
import { db } from "$lib/server/db";
import { desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	const suggestions = db
		.select({
			suggestion: table.suggestion,
			user: {
				id: table.user.id,
				username: table.user.username,
				displayName: table.user.displayName,
			},
		})
		.from(table.suggestion)
		.orderBy(desc(table.suggestion.createdAt))
		.leftJoin(table.user, eq(table.suggestion.authorId, table.user.id))
		.limit(10);

	const images = db.select().from(table.image);

	return { suggestions, images };
}) satisfies PageServerLoad;
