<script lang="ts">
	import Load from "$lib/icons/Load.svelte";
	import { fade } from "svelte/transition";
	import Suggestion from "./Suggestion.svelte";

	const { data } = $props();
	const { getSuggestions, getImages, count, session, message } = data;

	(async () => {
		console.log("🚀 ~ count:", await count);
	})();
</script>

{#if message}
	<div class="error">
		{message}
	</div>
{:else}
	<div class="suggestions-container">
		{#await getSuggestions}
			<div class="loading" in:fade|global={{ duration: 200 }} out:fade|global={{ duration: 200 }}>
				<Load />
			</div>
		{:then suggestions}
			{#if suggestions && getImages}
				<div class="suggestions">
					{#each suggestions as suggestion, index}
						<Suggestion {suggestion} {index} length={suggestions.length} {getImages} {session} />
					{/each}
				</div>
			{:else}
				<h2>No suggestions found</h2>
			{/if}
		{:catch error}
			<span class="error">An error occurred: {error.message}</span>
		{/await}
	</div>
{/if}

<style>
	.error {
		font-size: 2rem;
		color: red;
		text-align: center;
		margin-top: 2rem;
		width: 100%;
		display: block;
	}
	.suggestions-container {
		margin-block-start: 2rem;

		.loading {
			display: flex;
			justify-content: center;
			height: 0px;

			/* Note: :global {svg {}} does not work in this case, it must be :global(svg) {} */
			:global(svg) {
				height: 3rem;
				width: 3rem;
				animation: spinner 1s linear infinite;

				:global(path) {
					fill: var(--brand);
				}
			}
		}

		.suggestions {
			display: flex;
			justify-content: center;
			flex-wrap: wrap;
			gap: 1rem;
			width: 100%;
		}
	}

	@keyframes spinner {
		0% {
			transform: rotate(360deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
</style>
