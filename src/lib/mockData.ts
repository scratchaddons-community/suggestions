import { table } from "$lib";
import { db } from "./server/db";
import type { Image, Suggestion } from "./server/db/schema";

export async function mockSuggestion(userId: string): Promise<Suggestion> {
	const imageIds = (await db.select({ id: table.image.id }).from(table.image)).map(
		(image) => image.id,
	);

	const voterIds = (await db.select({ id: table.user.id }).from(table.user)).map(
		(suggestion) => suggestion.id,
	);

	function getRandomNItems<T>(arr: T[], n?: number): T[] {
		if (arr.length === 0) return [];

		const start = Math.floor(Math.random() * arr.length);
		const numberOfItems = n ?? arr.length - start;

		return arr.slice(start, start + numberOfItems);
	}
	return {
		id: crypto.randomUUID(),
		authorId: userId,
		title: `Suggestion ${(Math.random() * 10000).toFixed(0)}`,
		description: `Description ${(Math.random() * 10000).toFixed(0)}`,
		voterIds: getRandomNItems(voterIds as unknown as string[]),
		imageIds: getRandomNItems(imageIds),
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

export async function mockImage(): Promise<Image> {
	const width = Math.floor(Math.random() * 500) + 300;
	const height = Math.floor(Math.random() * 500) + 300;
	return {
		id: crypto.randomUUID(),
		url: `https://placehold.co/${width}x${height}`,
	};
}