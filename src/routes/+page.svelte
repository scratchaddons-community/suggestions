<script lang="ts">
	import Load from "$lib/icons/Load.svelte";
	import { fade, fly } from "svelte/transition";
	import Suggestion from "./Suggestion.svelte";
	import { enhance } from "$app/forms";
	import type { Suggestion as SuggestionType, User } from "$lib/server/db/schema";

	type returnedSuggestion = {
		suggestion: SuggestionType;
		user: Omit<User, "oauthProvider" | "oauthId"> | null;
	};

	const { data } = $props();
	const { getImages, count, session, message } = data;

	let getSuggestions = $state(data.getSuggestions);
	let numOfPages = $state(0);

	(async () => {
		const numOfSuggestions = await count;

		if (numOfSuggestions) numOfPages = Math.ceil(numOfSuggestions / 10);
	})();

	let page = $state(1);
	let sort = $state("newest");
	let navForm = $state([]) as HTMLFormElement[];
</script>

{#snippet navButtons(bottom = false)}
	<div class="navButtons">
		<form
			method="POST"
			action="?/sort"
			bind:this={navForm[bottom ? 1 : 0]}
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === "success") {
						const data = result.data as { suggestions: returnedSuggestion[]; page: number };
						if (data) {
							getSuggestions = (async () => {
								return data.suggestions;
							})();

							page = data.page;
						}
					}
				};
			}}
			in:fly|global={{ duration: 400, y: 100 }}
			out:fade|global={{ duration: 200 }}
			class:bottom
		>
			<input type="hidden" name="page" value={page} />
			<select
				name="sort"
				bind:value={sort}
				required
				onchange={() => {
					// Sneaky way to ensure that the form exists, the top form is always the first element in the array
					navForm[0].requestSubmit();
				}}
			>
				<option value="newest">Newest</option>
				<option value="oldest">Oldest</option>
				<option value="most-upvoted">Most Upvoted</option>
				<option value="least-upvoted">Least Upvoted</option>
			</select>
			<div class="section-2">
				<button type="submit" formaction="?/prev" disabled={page === 1}>Prev</button>
				<button type="submit" formaction="?/next" disabled={page >= numOfPages}>Next</button>
			</div>
		</form>
	</div>
{/snippet}

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
				{@render navButtons()}

				<div class="suggestions">
					{#each suggestions as suggestion, index}
						<Suggestion {suggestion} {index} length={suggestions.length} {getImages} {session} />
					{/each}
				</div>

				{#if suggestions.length >= 3}
					{@render navButtons(true)}
				{/if}
			{:else}
				<h2>No suggestions found</h2>
			{/if}
		{:catch error}
			<span class="error">An error occurred: {error.message}</span>
		{/await}
	</div>
{/if}

<style>
	form {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-block-end: 2rem;

		&.bottom {
			margin-block-start: 2rem;
		}

		button {
			transition:
				opacity 200ms,
				transform 200ms;
			&:disabled {
				opacity: 0.5;
				transform: scale(1);
			}
		}

		select {
			background-color: var(--surface2);
			color: var(--text-on-brand);
			border: none;
			border-radius: 0.5rem;
			font-size: 1rem;
			padding: 0.1rem;

			&:focus-visible {
				outline: none;
			}

			option {
				background-color: var(--surface2);
			}
		}
	}
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
