<script lang="ts">
	import { enhance } from "$app/forms";
	import Select from "svelte-select";
	import { labels } from "$lib";
	import { goto } from "$app/navigation";
	import {
		CldUploadWidget,
		type CloudinaryUploadWidgetInfo,
		configureCloudinary,
	} from "svelte-cloudinary";
	import { PUBLIC_VITE_CLOUDINARY_CLOUD_NAME } from "$env/static/public";

	const { data } = $props();
	const { tags } = data;

	const allTags = [...tags];
	const selectOptions = allTags.map((tag) => ({ value: tag, label: labels[tag] }));

	let submitting = $state(false);
	let valid = $state(true);
	let formElement = $state() as HTMLFormElement;

	let imageDatas = $state([]) as (CloudinaryUploadWidgetInfo | string | undefined)[];

	function validateForm() {
		console.log(formElement.checkValidity());
	}

	configureCloudinary({
		cloudName: PUBLIC_VITE_CLOUDINARY_CLOUD_NAME,
	});
</script>

<div class="add-suggestion">
	<h1>Add a suggestion</h1>

	<div class="suggestion-form">
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ result }) => {
					console.log("🚀 ~ return ~ result:", result);
					if (result.type === "success") submitting = false;
					if (result.status !== 400) goto("/");
				};
			}}
			action="?/suggestion"
			onchange={validateForm}
			bind:this={formElement}
		>
			<div class="top">
				<input
					type="text"
					name="title"
					placeholder="Title"
					required
					minlength="3"
					maxlength="100"
				/>
				<Select placeholder="Tag" items={selectOptions} name="tag" required searchable={false} />
			</div>

			<textarea name="description" placeholder="Description" required minlength={5} maxlength={1000}
			></textarea>

			<CldUploadWidget
				uploadPreset="sa-suggestions"
				let:open
				let:isLoading
				options={{ cropping: true }}
				onSuccess={(e) => {
					// @ts-ignore
					const info = e.info;
					console.log("🚀 ~ info:", info);
					imageDatas.push(info);
				}}
			>
				<button type="button" onclick={() => open()} disabled={isLoading}> Open the widget </button>
			</CldUploadWidget>

			<input type="hidden" name="imageDatas" value={JSON.stringify(imageDatas)} />
			<button type="submit" disabled={submitting || !valid}>Submit</button>
		</form>
	</div>
</div>

<style>
	.add-suggestion {
		display: flex;
		flex-direction: column;
		align-items: center;

		.suggestion-form {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			form {
				width: 50%;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 1rem;

				@media (width <= 768px) {
					width: 90%;
				}

				input,
				textarea {
					background-color: var(--surface1);
					border: 2px transparent solid;

					&:focus {
						border: 2px var(--brand) solid;
					}
				}

				.top {
					width: 100%;
					display: flex;
					gap: 1rem;

					input {
						width: -webkit-fill-available;
					}
				}

				textarea {
					width: 100%;
					height: 15rem;
					resize: none;
					font-family: inherit;

					-webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
					-moz-box-sizing: border-box; /* Firefox, other Gecko */
					box-sizing: border-box; /* Opera/IE 8+ */
				}

				:global(.svelte-select) {
					--border: 2px transparent solid;
					--border-hover: 2px transparent solid;
					background-color: var(--surface1);

					width: 11rem;
					max-width: 50%;
				}
			}
		}
	}
</style>
