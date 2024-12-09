<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const { user } = data;
</script>

<div class="account">
	<h1>Hello {user?.displayName || user?.username}!</h1>

	<form method="post">
		<button>Log out</button>
	</form>
</div>

<style>
	.account {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
