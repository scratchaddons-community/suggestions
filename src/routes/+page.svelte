<script lang="ts">
	import Load from "$lib/icons/Load.svelte";
	import { fade, fly } from "svelte/transition";
	import Suggestion from "./Suggestion.svelte";
	import { enhance } from "$app/forms";
	import type { Suggestion as SuggestionType, User } from "$lib/server/db/schema";
	import Select from "svelte-select";
	import { browser } from "$app/environment";

	type returnedSuggestion = {
		suggestion: SuggestionType;
		user: Omit<User, "oauthProvider" | "oauthId"> | null;
	};

	const { data } = $props();
	const { getImages, count, session, message } = data;
	const sortItems = [
		{
			value: "trending",
			label: "Trending",
		},
		{
			value: "newest",
			label: "Newest",
		},
		{
			value: "oldest",
			label: "Oldest",
		},
		{
			value: "most",
			label: "Most upvoted",
		},
		{
			value: "least",
			label: "Least upvoted",
		},
	];

	let getSuggestions = $state(data.getSuggestions);
	let numOfPages = $state(0);

	(async () => {
		const numOfSuggestions = await count;

		if (numOfSuggestions) numOfPages = Math.ceil(numOfSuggestions / 10);
	})();

	let page = $state(1);
	let sort = $state(sortItems[0]);
	let navForm = $state() as HTMLFormElement;
	$inspect(sort);

	let observer = $state() as IntersectionObserver;

	if (browser) {
		observer = new IntersectionObserver(
			([e]) => e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
			{ threshold: [1] },
		);
	}

	let sortForm = $state() as HTMLFormElement;
</script>

{#snippet pageInput()}
	<input type="hidden" name="page" bind:value={page} />
{/snippet}

{#snippet navFilterSearch()}
	<div class="allNav" use:observer.observe>
		<div class="bottom">
			<div class="sort">
				<form
					method="POST"
					action="?/sort"
					bind:this={sortForm}
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === "success") {
								const data = result.data as {
									suggestions: returnedSuggestion[];
									page: number;
									sort: string;
								};
								console.log("🚀 ~ return ~ data:", data);

								if (data) {
									getSuggestions = (async () => {
										return data.suggestions;
									})();
								}
							}
						};
					}}
				>
					{@render pageInput()}
					<Select
						name="sort"
						items={sortItems}
						required
						class="sort-select"
						on:change={() => {
							sortForm.requestSubmit();
						}}
						searchable
						bind:value={sort}
					/>
				</form>
			</div>

			<div class="navButtons">
				<form
					method="POST"
					bind:this={navForm}
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
				>
					{@render pageInput()}
					<input
						type="hidden"
						name="sort"
						bind:value={() => JSON.stringify(sort), (v) => JSON.parse(v)}
					/>
					<button type="submit" formaction="?/prev" disabled={page === 1}>Prev</button>
					<button type="submit" formaction="?/next" disabled={page >= numOfPages}>Next</button>
				</form>
			</div>
		</div>
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
				{@render navFilterSearch()}

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
		display: flex;

		flex-direction: column;
		align-items: center;
		margin-block-end: 2rem;

		.allNav {
			display: flex;
			flex-direction: column;
			width: 80%;
			position: sticky;
			z-index: 2;
			top: -1px;
			padding: 0.5rem 1rem 0 1rem;
			background-color: var(--background);
			margin-block-end: 2rem;
			transition:
				padding var(--transition-short),
				background-color var(--transition-short);

			:global(&.is-pinned) {
				padding: 1rem;
			}

			& > div {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;

				.sort {
					:global {
						.sort-select {
							width: 12rem;
							transition:
								background-color var(--transition-short),
								border var(--transition-short);

							--item-is-active-bg: var(--brand);
							--border: color-mix(in srgb, var(--brand) 20%, transparent) 2px solid;
							--border-hover: color-mix(in srgb, var(--brand) 40%, transparent) 2px solid;
							--item-hover-bg: color-mix(in srgb, var(--brand) 70%, transparent);
							--border-focused: var(--brand) 2px solid;
							--clear-select-focus-outline: none;
							--list-background: var(--surface1);
							--border-radius: 0.5rem;
							--list-border-radius: 0.5rem;
							--list-border: var(--surface2) 2px solid;
						}
					}
				}

				.navButtons {
					display: flex;
					align-items: center;

					form {
						display: flex;
						justify-content: center;
						gap: 1rem;

						button {
							transition:
								opacity var(--transition-short),
								transform var(--transition-short);
							&:disabled {
								opacity: 0.5;
								transform: scale(1);
							}
						}
					}
				}
			}
		}

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
