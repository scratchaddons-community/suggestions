<script lang="ts">
	import { page } from "$app/state";
	import { SA } from "$lib/icons";
</script>

<footer>
	<div class="footer-inner">
		<div class="top">
			<a class="brand" href="https://sa-suggestions.vercel.app/">
				<SA />
				SA Suggestions
			</a>
			<div class="links">
				<a href="https://github.com/Jazza-231/sa-suggestions">Repository</a>
				<a href="https://scratchaddons.com/">Scratch Addons</a>
				<a href="/about">About</a>
			</div>
		</div>

		<div class="bottom">
			{#if !page.error}
				<div class="disclaimer">
					This website is NOT official, and IS a work in progress. Please see the <a href="privacy"
						>privacy policy</a
					> for information on the data we use.
				</div>
			{:else}
				<div class="error">
					This website is NOT official, and IS broken (apparently, you are on an error page). Please
					see the <a href="privacy">privacy policy</a> for information on the data we use.
				</div>
			{/if}
		</div>
	</div>
</footer>

<style>
	footer {
		display: flex;
		justify-content: center;
		flex-shrink: 0;
		margin-block-start: 1rem;

		.footer-inner {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background-color: var(--surface1);
			transition: background-color var(--transition-short);
			padding: 1rem;
			width: 25rem;
			max-width: 80%;
			border-top-left-radius: 0.5rem;
			border-top-right-radius: 0.5rem;
			box-shadow: var(--footer-drop-shadow);

			.brand {
				display: flex;
				align-items: center;
				justify-content: center;
				text-decoration: none;
				font-size: 1.5rem;
				font-weight: bold;
				color: var(--text);
				transition: color var(--transition-short);

				:global {
					svg {
						height: 2rem;
						fill: var(--text);
						transition: fill var(--transition-short);
					}
				}
			}

			.links {
				display: flex;
				gap: 0.5rem;
				margin-block-start: 0.5rem;
			}

			.disclaimer,
			.error {
				margin-block-start: 1rem;
			}
		}
	}
</style>
