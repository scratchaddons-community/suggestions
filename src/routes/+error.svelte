<script lang="ts">
	import { page } from "$app/state";
</script>

<div class="error">
	<h1>{page.status}: {page.error?.message}</h1>

	<p>
		If you think this is an unexpected error, please report it on <a
			href="https://github.com/Jazza-231/sa-suggestions/issues">GitHub</a
		>.
	</p>
</div>

<style>
	.error {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
