<script lang="ts">
	import { SA } from "$lib/icons";
</script>

<footer>
	<div class="footer-inner">
		<div class="top">
			<a class="icon" href="https://sa-suggestions.vercel.app/">
				<SA />
				SA Suggestions
			</a>
			<div class="links">
				<a href="https://github.com/Jazza-231/sa-suggestions">Repository</a>
				<a href="https://scratchaddons.com/">Scratch Addons</a>
			</div>
		</div>

		<div class="bottom">
			<div class="disclaimer">
				This website is NOT official, and IS a work in progress. Please see the <a href="privacy"
					>privacy policy</a
				> for information on the data we use.
			</div>
		</div>
	</div>
</footer>

<style>
	footer {
		display: flex;
		justify-content: center;
		flex-shrink: 0;
		margin-block-start: 1rem;

		a {
			color: var(--brand);
		}

		.footer-inner {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background-color: var(--surface1);
			transition: background-color var(--transition-short);
			padding: 1rem;
			width: 35rem;
			max-width: 80%;
			border-top-left-radius: 0.5rem;
			border-top-right-radius: 0.5rem;
			box-shadow: var(--footer-drop-shadow);

			.icon {
				display: flex;
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
				gap: 1rem;
			}

			.disclaimer {
				margin-block-start: 1rem;
			}
		}
	}
</style>
