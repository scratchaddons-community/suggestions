<script lang="ts">
	import { cloudinary } from "$lib/cloudinary";
	import { Tween } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import { Delete } from "$lib/icons";

	interface Image {
		id: string;
		name: string;
		arrayBuffer: ArrayBuffer;
		base64?: string;
		progressTween?: Tween<number>;
		status?: "uploading" | "uploaded" | "failed" | "deleting" | "errorDeleting";
		url?: string;
		folder?: string;
		cloudinaryId?: string;
		dimensions?: {
			width: number;
			height: number;
		};
		error?: Error;
	}

	let images: Image[] = $state([]);
	$inspect(images);

	function addImage(id: string, name: string, arrayBuffer: ArrayBuffer) {
		if (images.map((image) => image.id).indexOf(id) === -1) {
			const progressTween = new Tween(0, { duration: 1000, easing: cubicInOut });
			images.push({ id, name, arrayBuffer, progressTween });
		}
	}

	function updateImage(id: string, { ...args }: Partial<Image>) {
		const imageIndex = images.findIndex((image) => image.id === id);
		if (imageIndex !== -1) {
			images[imageIndex] = { ...images[imageIndex], ...args };
		}
	}

	function removeImage(id: string) {
		const imageIndex = images.findIndex((image) => image.id === id);
		if (imageIndex !== -1) {
			images.splice(imageIndex, 1);
		}
	}

	function handleAddImages() {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.multiple = true;
		fileInput.accept = "image/*";

		fileInput.onchange = async () => {
			const files = Array.from(fileInput.files || []);
			await handleFiles(files);
		};

		fileInput.click();
	}

	function handleDropImages(e: DragEvent) {
		e.preventDefault();

		const files = Array.from(e.dataTransfer?.files || []).filter((file) =>
			file.type.startsWith("image"),
		);
		handleFiles(files);
	}

	async function handleFiles(files: File[]) {
		for (const file of files) {
			const id = crypto.randomUUID();

			addImage(id, file.name, await file.arrayBuffer());

			try {
				const reader = new FileReader();

				const imageData = await new Promise<string>((resolve, reject) => {
					reader.onload = () => {
						const imageData = reader.result as string;
						updateImage(id, { base64: imageData });
						resolve(imageData as string);
					};
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});

				cloudinary
					.upload(imageData)
					.onProgress((progress) => {
						const image = images.find((img) => img.id === id);
						if (image?.progressTween) {
							image.progressTween.target = progress;
						}
						updateImage(id, { status: "uploading" });
					})
					.onSuccess((result) => {
						console.log(result);

						updateImage(id, {
							url: result.secure_url,
							cloudinaryId: result.public_id,
							dimensions: {
								width: result.width,
								height: result.height,
							},
							status: "uploaded",
						});
					})
					.onError((error) => {
						console.error("Upload failed:", error);
						updateImage(id, { status: "failed", error });
					})
					.start();
			} catch (error) {
				if (error instanceof Error) {
					console.error("Upload failed:", error);
					updateImage(id, { status: "failed", error });
				}
			}
		}
	}
</script>

<div
	class="drop"
	ondragover={(e) => {
		e.preventDefault();
	}}
	ondrop={handleDropImages}
	role="none"
	onclick={handleAddImages}
>
	<span>Add Images</span>
</div>

<div class="images">
	{#each images as image (image.id)}
		{#if image.status !== "deleting"}
			<div class="img-container">
				<span>
					{#if image.status === "uploaded"}
						<button
							onclick={async () => {
								if (image.status === "deleting") return;

								updateImage(image.id, { status: "deleting" });

								try {
									const response = await cloudinary.delete(image.cloudinaryId || "", image.id);
									if (typeof response === "object") throw new Error(response.message);
									removeImage(response);

									// This does not work, and I am not sure why. The logs are...something. Take a look at wtf.png
									// if you log image.id and response, you will see they don't match
									// Fixed by adding a key to the each block - https://svelte.dev/tutorial/svelte/keyed-each-blocks
									// await cloudinary.delete(image.cloudinaryId || "", image.id);
									// removeImage(image.id);
								} catch (error) {
									console.error("Failed to delete:", error);
									updateImage(image.id, { status: "errorDeleting" });
								}
							}}
							class="delete-button omit-styles"
						>
							<Delete />
						</button>
					{:else if image.status === "uploading"}
						<span class="progress">
							{image.progressTween?.current?.toFixed()}%
						</span>
					{/if}
				</span>

				<svg
					class="progress-border"
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
				>
					<rect
						stroke-dasharray="400"
						stroke-dashoffset={image.status === "uploaded"
							? 0
							: 400 - (image.progressTween?.current || 0) * 0.92}
						class:done={image.status === "uploaded"}
						rx="4px"
					/>
				</svg>

				<img src={image.base64} alt={image.name} />
			</div>
		{/if}
	{/each}
</div>

<style>
	.images {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: 1rem;
		margin-block: 2rem;
		width: 50%;

		@media (width <= 768px) {
			grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
			width: 90%;
		}

		.img-container {
			position: relative;
			aspect-ratio: 1;
			width: 100%;
			background-color: var(--surface1);
			border-radius: 0.5rem;
			height: -webkit-fill-available;
			max-width: 24rem;
			padding: 0.35rem;

			.progress {
				position: absolute;
				z-index: 2;
				font-size: 1.2rem;
				color: var(--text);
				background-color: color-mix(in srgb, var(--surface1) 50%, transparent);
				text-align: center;
				padding: 0.2rem 0.3rem;
			}

			.progress-border {
				position: absolute;
				inset: 0;
				z-index: 1;
				width: 100%;
				height: 100%;
				border-radius: 0.5rem;

				rect {
					stroke: var(--brand);
					stroke-width: 0.25rem;
					width: 100%;
					height: 100%;
					transition:
						stroke-dashoffset calc(var(--transition-short) * 4),
						stroke calc(var(--transition-short) * 4);

					&.done {
						stroke: color-mix(in srgb, var(--brand) 50%, transparent);
					}

					&:not(.done) {
						transition: none;
					}
				}
			}

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				border-radius: 0.3rem;
			}

			span {
				position: absolute;
				padding: 0.25rem 0.15rem;
				border-radius: 0.25rem;

				z-index: 2;
			}

			button {
				background-color: transparent;
				border: none;
				padding: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				cursor: pointer;

				:global {
					svg {
						width: 3rem;
						height: auto;
						path {
							fill: var(--brand);
							filter: drop-shadow(0 0 0.1rem black);
						}
					}
				}
			}
		}
	}

	.drop {
		width: 50%;
		height: 20rem;
		border: var(--brand) dashed 3px;
		margin-block: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;

		@media (width <= 768px) {
			width: 90%;
			height: 13rem;
		}

		span {
			font-size: 1.5rem;

			@media (width <= 768px) {
				font-size: 1.3rem;
			}
		}
	}
</style>
