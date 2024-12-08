<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const { user } = data;

	console.log(user);
</script>

<h1>Hello {user?.displayName || user?.username}!</h1>

<form method="post">
	<button>Log out</button>
</form>
