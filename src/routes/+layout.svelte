<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import "../vars.css";
	import "../app.css";
	import Header from "./Header.svelte";
	import { injectAnalytics } from "@vercel/analytics/sveltekit";
	import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
	import { dev } from "$app/environment";

	if (!dev) {
		injectAnalytics();
		injectSpeedInsights();
	}

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const { session } = $derived(data);
</script>

<Header {session} />

<main>
	{@render children()}
</main>

<style>
	main {
		padding: 0.5rem;
	}
</style>
