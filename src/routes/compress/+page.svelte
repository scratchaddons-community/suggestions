<!-- Claude and chat gpt generated code -->
<!-- That's ok cuz it's just a test which I might as well leave in for some easy compression -->
<script lang="ts">
	import { Compare } from "$lib/icons";
	import { compress } from "$lib/images/compress";

	let isDragging = $state(false);
	let position = $state(50);
	let beforeImage = $state<string | null>(null);
	let afterImage = $state<string | null>(null);
	let beforeSize = $state<number | null>(null);
	let afterSize = $state<number | null>(null);

	let container: HTMLDivElement;
	let before: HTMLDivElement;
	let after: HTMLDivElement;

	async function handleImage(e: Event) {
		const image = (e.target as HTMLInputElement).files?.[0];
		if (!image) return;

		beforeSize = Math.round(image.size / 1024);
		beforeImage = URL.createObjectURL(image);

		compress(image, null, "preprocess")
			.then((file) => {
				afterSize = Math.round(file.size / 1024);
				afterImage = URL.createObjectURL(file);
			})
			.catch((error: Error) => {
				console.error("Compression failed:", error.message);
			});
	}

	function handleMouseDown() {
		isDragging = true;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !container) return;

		const rect = container.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		position = (x / rect.width) * 100;
	}

	$effect(() => {
		if (typeof window !== "undefined") {
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("mousemove", handleMouseMove);

			return () => {
				document.removeEventListener("mouseup", handleMouseUp);
				document.removeEventListener("mousemove", handleMouseMove);
			};
		}
	});
</script>

<div class="wrapper">
	<input type="file" name="image" accept="image/*" onchange={handleImage} class="file-input" />

	<div bind:this={container} class="container">
		<!-- Original image on the left -->
		<div
			bind:this={before}
			class="image-container"
			style="clip-path: inset(0 {100 - position}% 0 0)"
		>
			{#if beforeImage}
				<img src={beforeImage} alt="Original" />
				<div class="file-size">{beforeSize} KB</div>
			{:else}
				<div class="placeholder">
					<span>Original</span>
				</div>
			{/if}
		</div>

		<!-- Compressed image on the right -->
		<div bind:this={after} class="image-container" style="clip-path: inset(0 0 0 {position}%)">
			{#if afterImage}
				<img src={afterImage} alt="Compressed" />
				<div class="file-size">{afterSize} KB</div>
			{:else}
				<div class="placeholder compressed">
					<span>Compressed</span>
				</div>
			{/if}
		</div>

		<!-- Slider handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="slider-handle" style="left: {position}%" onmousedown={handleMouseDown}>
			<div class="handle-circle">
				<div class="handle-arrows"><Compare /></div>
			</div>
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 80rem;
		max-width: 90%;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;

		input {
			max-width: fit-content;
		}
	}

	.file-input {
		margin-bottom: 1rem;
	}

	.container {
		position: relative;
		width: 100%;
		height: 35rem;
		overflow: hidden;
		border: 2px solid var(--surface2);
		border-radius: 0.5rem;
	}

	.image-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface2);
	}

	.placeholder.compressed {
		background-color: var(--surface1);
	}

	.placeholder span {
		color: var(--text);
	}

	.file-size {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--text);
		font-size: 1.5rem;
		font-weight: bold;
		text-shadow: 0 0 6px rgba(0, 0, 0, 1);
		pointer-events: none;
	}

	.slider-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: var(--surface1);
		cursor: ew-resize;
		user-select: none;
	}

	.handle-circle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 32px;
		height: 32px;
		background-color: var(--surface1);
		transition: background-color var(--transition-short);
		border-radius: 50%;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.handle-arrows {
		:global {
			svg {
				display: flex;
				width: 1.75rem;
				height: 1.75rem;

				path {
					fill: var(--brand);
				}
			}
		}
	}
</style>
