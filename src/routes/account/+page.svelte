<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const { user } = data;
</script>

<div class="account">
	<h1>Hello {user?.displayName || user?.username}!</h1>

	<form class="buttons" method="POST" use:enhance>
		<button formaction="?/logout">Log out</button>
		<button formaction="?/suggestion">Add mock suggestion</button>
		<button formaction="?/image">Add mock image</button>
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
