<script lang="ts">
	import potat from "$lib/images/Potat.svg";
	import type { Image, Suggestion, User } from "$lib/server/db/schema";
	import { fade, fly } from "svelte/transition";

	type Props = {
		suggestion: {
			suggestion: Suggestion;
			user: Omit<User, "oauthProvider" | "oauthId"> | null;
		};
		imagesCall: Promise<Image[]>;
		index: number;
		length: number;
	};

	const { index, length, suggestion, imagesCall }: Props = $props();

	function reverseStaggeredDelay(
		length: number,
		index: number,
		duration: number,
		delay: number,
		max: number,
	) {
		// If the total duration of the animation is greater than the max,
		// skip the elements later in the list (aka the ones with the smallest delay)
		const totalDuration = length * duration + length * delay;
		const trimOff = totalDuration - max;
		const transitionsToSkip = Math.ceil(trimOff / (duration + delay));
		if (length - index <= transitionsToSkip) return { duration, delay: 0 };

		return { duration, delay: (length - transitionsToSkip) * delay - index * delay };
	}
</script>

<div
	class="suggestion"
	in:fly|global={{ duration: 400, y: 100, delay: index * 100 }}
	out:fade|global={reverseStaggeredDelay(length, index, 200, 25, 1000)}
>
	<div class="left">
		<div class="title">
			<h2>{suggestion.suggestion.title}</h2>
		</div>

		<div class="author">
			{#if suggestion.user}
				<span class="author-name">{suggestion.user.displayName || suggestion.user.username}</span>
			{:else}
				<span class="author-name">User not found.</span>
			{/if}
			<span class="author-date">{new Date(suggestion.suggestion.createdAt).toLocaleString()}</span>
		</div>

		{#if suggestion.suggestion.tags}
			<div class="tags">
				{#each suggestion.suggestion.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}

		<div class="description">
			<p>{suggestion.suggestion.description}</p>
		</div>

		<div class="votes">
			<img src={potat} alt="potat" />
			{#if suggestion.suggestion.voterId}
				<span class="votes-count">{suggestion.suggestion.voterId.length}</span>
			{/if}
		</div>
	</div>

	{#await imagesCall then images}
		{#each images as image}
			{#if suggestion.suggestion.imageIds && suggestion.suggestion.imageIds[0] === image.id}
				<div class="images">
					<!-- svelte-ignore a11y_missing_attribute -->
					<img
						src={image.url}
						onload={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.opacity = "1";
						}}
						onerror={(e) => {
							const target = e.target as HTMLImageElement;
							target.after(document.createTextNode("Failed to load image"));
						}}
					/>
				</div>
			{/if}
		{/each}
	{/await}
</div>

<style>
	.suggestion {
		background-color: var(--surface1);
		transition:
			background-color 200ms,
			transform 200ms,
			box-shadow 200ms;
		padding: 1rem;
		border-radius: 1rem;
		width: 60%;
		display: flex;
		justify-content: space-between;
		user-select: none;
		cursor: pointer;
		box-shadow: 0 0 1rem 0.1rem rgba(0, 0, 0, 0.3);

		&:hover {
			transform: translateY(-0.2rem);
			z-index: 1;
			box-shadow: 0 0.5rem 1rem 0.1rem rgba(0, 0, 0, 0.3);
		}

		@media (width <= 768px) {
			flex-direction: column;
		}

		.title {
			h2 {
				margin-block-end: 0;
				margin-block-start: 0.5rem;
				font-size: 1.3rem;
			}
		}

		.author {
			.author-date {
				font-size: 0.8rem;
				margin-left: 0.3rem;
			}
		}

		.tags {
			font-size: 0.8rem;
			display: flex;
			gap: 0.4rem;
			margin-block-start: 0.4rem;
			align-items: center;

			.tag {
				background-color: var(--surface2);
				transition: background-color 200ms;
				/* Something I don't like is having to set an arbitrary size to get a pill shape, using percentages does not apply consistent rounding*/
				border-radius: 1rem;
				padding: 0.25rem 0.35rem;
			}
		}

		.votes {
			display: flex;
			width: fit-content;
			min-width: 2rem;
			padding: 0.5rem;
			align-items: center;
			justify-content: center;
			border-radius: 1rem;
			gap: 0.3rem;
			background-color: var(--surface2);
			transition:
				background-color 200ms,
				border 200ms;
			border: transparent 1px solid;

			&:hover {
				border: color-mix(in srgb, var(--text) 80%, transparent) 1px solid;
			}

			.votes-count {
				font-size: 1.1rem;
			}

			img {
				align-self: flex-end;
				position: relative;
				bottom: 2px;
				width: 1rem;
			}
		}

		.images {
			margin-left: 1rem;
			display: flex;
			align-items: center;
			justify-content: end;
			min-width: 12rem;

			@media (width <= 768px) {
				margin-left: 0;
				margin-block-start: 1.5rem;
				justify-content: center;
			}
			img {
				width: -webkit-fill-available;
				max-width: 15rem;
				height: auto;
				max-height: 15rem;
				border-radius: 0.6rem;
				opacity: 0;
				transition: opacity 200ms;
				box-shadow: -0.4rem 0.4rem 1rem 0 rgba(0, 0, 0, 0.4);
			}
		}
	}
</style>
