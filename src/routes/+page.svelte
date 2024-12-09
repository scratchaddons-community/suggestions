<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const { suggestions: dbCall } = data;
</script>

<div class="suggestions">
	{#await dbCall}
		<div class="loading">Loading...</div>
	{:then suggestions}
		{#each suggestions as suggestion}
			<div class="suggestion">
				<pre>
					{JSON.stringify(suggestion, null, 2)}
				</pre>
			</div>
		{/each}
	{/await}
</div>
