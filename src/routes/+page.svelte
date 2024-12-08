<script lang="ts">
	const { data } = $props();
	console.log("🚀 ~ data:", data);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<form method="POST">
	<button formaction="?/github">Sign in with Github</button>
	<button formaction="?/scratch">Sign in with Scratch</button>
</form>
