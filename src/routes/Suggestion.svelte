<script lang="ts">
	import { enhance } from "$app/forms";
	import potat from "$lib/images/Potat.svg";
	import type { Image, Session, Suggestion, User } from "$lib/server/db/schema";
	import { fade, fly } from "svelte/transition";
	import { labels } from "$lib";
	import { generateUrl } from "$lib/cloudinary/url";

	type Props = {
		suggestion: {
			suggestion: Suggestion;
			user: { id: string; username: string; displayName: string | null } | null;
		};
		getImages: Promise<Image[]>;
		index: number;
		length: number;
		session: Session | null;
	};

	const { index, length, getImages, session, suggestion: suggestionAndUser }: Props = $props();
	const { suggestion, user } = $derived(suggestionAndUser);

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

	let voting = $state(false);
	// svelte-ignore state_referenced_locally - its ok because we don't care, thats what $effect is for
	let voteCount = $state(suggestion.voterIds?.length ?? 0);
	// svelte-ignore state_referenced_locally
	let voted = $state(suggestion.voterIds?.includes(session?.userId ?? "") ?? false);

	$effect(() => {
		voteCount = suggestion.voterIds?.length ?? 0;
		voted = suggestion.voterIds?.includes(session?.userId ?? "") ?? false;
	});

	const classStyles = {
		rejected: "#ff000_080",
		impossible: "#ff000_080",
		impractical: "#ff7b2_680",
		incompatible: "#ff7b2_680",
		implemented: "#00_800_080",
		pending: "#37acff80",
		good: "#6db02_180",
		"in-dev": "#ffff0_080",
	};
</script>

<!-- out:fade|global={reverseStaggeredDelay(length, index, 200, 25, 1_000)} -->
<div
	class="suggestion"
	in:fly|global={{ duration: 400, y: 100, delay: index * 100 }}
	onoutrostart={(e) => {
		// Something REALLY odd happens...sometimes the next page starts rendering before the transition is finished. It happens genuinely randomly...
		// So I do this just in case lol, currently removed because I added a transition with a delay
		// @ts-ignore
		// e.target.parentElement.parentElement.style = `
		// height: 0;
		// margin: 0;
		// transform: translateY(1rem);`;
	}}
	onoutroend={(e) => {
		// @ts-ignore
		e.target.parentElement.parentElement.style = "";
	}}
>
	<div class="left">
		<div class="title">
			<h2>{suggestion.title}</h2>
		</div>

		<div class="author">
			{#if user}
				<span class="author-name">{user.displayName || user.username}</span>
			{:else}
				<span class="author-name">User not found.</span>
			{/if}
			<span class="author-date">{new Date(suggestion.createdAt).toLocaleString()}</span>
		</div>

		{#if suggestion.tag}
			{@const status = suggestion.status}
			<div class="tag">
				<span class="single-tag" style:background-color={classStyles[status]}>{labels[status]}</span
				>
				<span class="single-tag">{labels[suggestion.tag]}</span>
			</div>
		{/if}

		<div class="description">
			<p>{suggestion.description}</p>
		</div>

		<form
			method="POST"
			action="?/vote"
			use:enhance={() => {
				voting = true;
				voteCount = voted ? voteCount - 1 : voteCount + 1;
				voted = !voted;

				return async ({ result }) => {
					voting = false;
					if (result.type === "success" && result.data) {
						const { data } = result as unknown as {
							data: { count: number; action: "add" | "remove" };
						};

						if (data.count) voteCount = data.count;
						if (data.action === "remove") voted = false;
						else voted = true;
					} else if (result.status === 429) {
						alert("Slow down!");
					}
				};
			}}
		>
			<input type="hidden" name="suggestionId" value={suggestion.id} />
			<button class="votes omit-styles" type="submit" disabled={voting || !session} class:voted>
				<img src={potat} alt="potat" />
				{#if suggestion.voterIds}
					<span class="votes-count">{voteCount}</span>
				{/if}
			</button>
		</form>
	</div>

	{#await getImages then images}
		{#each images as image}
			{#if suggestion.imageIds && suggestion.imageIds[0] === image.id}
				{@const url = image.cloudinaryId
					? generateUrl(image.cloudinaryId, undefined, "thumbnail")
					: image.url}
				<div class="images">
					<!-- svelte-ignore a11y_missing_attribute -->
					<img
						src={url}
						onload={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.opacity = "1";
						}}
						onerror={(e) => {
							const target = e.target as HTMLImageElement;
							const failed = document.createElement("span");
							failed.textContent = "Failed to load image sowwy";
							target.after(failed);
						}}
						width={image.resolution?.x}
						height={image.resolution?.y}
						loading={index > 2 ? "lazy" : "eager"}
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
			background-color var(--transition-short),
			transform var(--transition-short),
			box-shadow var(--transition-short);
		padding: 1rem;
		border-radius: 1rem;
		width: 60%;
		display: flex;
		justify-content: space-between;
		user-select: none;
		cursor: pointer;
		box-shadow: 0 0 1rem 0.1rem rgba(0, 0, 0, 0.3);

		@media (width <= 768px) {
			width: 85%;
		}

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

		.tag {
			font-size: 0.8rem;
			display: flex;
			gap: 0.4rem;
			margin-block-start: 0.4rem;
			align-items: center;

			.single-tag {
				background-color: var(--surface2);
				transition: background-color var(--transition-short);
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
				background-color var(--transition-short),
				border var(--transition-short);
			border: transparent 2px solid;
			cursor: pointer;

			&.voted {
				background-color: #5dc1ff40;
				border: #5dc1ff66 2px solid;
			}

			&:hover {
				border: color-mix(in srgb, var(--text) 80%, transparent) 2px solid;
			}

			.votes-count {
				font-size: 1.1rem;
				color: var(--text);
				transition: color var(--transition-short);
				margin-left: 0.1rem;
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

			:global(span) {
				animation: fade-in calc(var(--transition-short) * 2) forwards;
			}

			@media (width <= 768px) {
				margin-left: 0;
				margin-block-start: 1.5rem;
				justify-content: center;
			}

			img {
				width: 100%;
				height: auto;
				max-width: 15rem;
				max-height: 15rem;
				border-radius: 0.6rem;
				opacity: 0;
				transition: opacity var(--transition-short);
				box-shadow: -0.4rem 0.4rem 1rem 0 rgba(0, 0, 0, 0.4);
				object-fit: cover;
			}
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
