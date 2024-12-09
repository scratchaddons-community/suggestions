import { table } from "$lib";
import { db } from "./server/db";
import type { Suggestion } from "./server/db/schema";

export async function mockSuggestion(): Promise<Suggestion> {
	return {
		id: crypto.randomUUID(),
		authorId: (await db.select({ id: table.user.id }).from(table.user))[0].id,
		title: `Suggestion ${(Math.random() * 10000).toFixed(0)}`,
		description: `Description ${(Math.random() * 10000).toFixed(0)}`,
		voterId: null,
		imageIds: null,
		tags: (() => {
			const tags: Suggestion["tags"] = ["website", "editor", "other"];
			return [tags[Math.floor(Math.random() * tags.length)]];
		})(),
		status: (() => {
			const statuses: Suggestion["status"][] = [
				"pending",
				"good",
				"implemented",
				"in-dev",
				"incompatible",
				"impractical",
				"rejected",
				"impossible",
			];
			return statuses[Math.floor(Math.random() * statuses.length)];
		})(),
		createdAt: new Date(Date.now()),
	};
}
