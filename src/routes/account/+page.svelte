<script lang="ts">
	import { enhance } from "$app/forms";
	import { fade } from "svelte/transition";
	import type { PageData } from "./$types";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";

	let { data }: { data: PageData } = $props();
	const { user } = data;

	const showMock = true;

	if (browser) {
		console.log(document.cookie);
	}
</script>

<!-- in:fade|global={{ duration: 200, delay: 300 }} -->
<div class="account">
	<h1>Hello {user?.displayName || user?.username}!</h1>

	<form
		class="buttons"
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === "failure") {
					alert(result.data?.message ?? "Something went wrong");
					goto("/");
				}
			};
		}}
	>
		<button formaction="?/logout">Log out</button>
		{#if showMock}
			<button formaction="?/suggestion">Add mock suggestion</button>
			<button formaction="?/image">Add mock image</button>
		{/if}
	</form>
</div>

<style>
	.account {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.buttons {
			gap: 1rem;
			display: flex;
		}
	}
</style>
