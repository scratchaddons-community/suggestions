// place files you want to import through the `$lib` alias in this folder.
export * as auth from "$lib/server/auth";
export * as table from "$lib/server/db/schema";

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
