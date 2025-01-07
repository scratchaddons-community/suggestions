import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { session }, depends }) => {
	depends("session");

	return { session };
}) satisfies LayoutServerLoad;
