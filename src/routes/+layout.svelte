<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import "../vars.css";
	import "../app.css";
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
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

<Footer />

<style>
	main {
		padding: 0.5rem;
		flex: 1 0 auto;
	}
</style>
