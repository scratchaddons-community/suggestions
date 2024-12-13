<script>
	import { fade } from "svelte/transition";
</script>

<div class="login" in:fade|global={{ duration: 200, delay: 300 }}>
	<form method="POST">
		<div class="community">
			<button formaction="?/scratch">Sign in with Scratch</button>
		</div>
		<div class="staff">
			<div class="seperator">
				<div></div>
				<div>or, staff:</div>
				<div></div>
			</div>
			<button formaction="?/github">Sign in with Github</button>
		</div>
	</form>
</div>

<style>
	.login {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-block-start: 5rem;
		height: 50vh;

		form {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			align-items: center;

			.community button {
				font-size: 1.5rem;
				padding: 1rem;
				box-shadow: 0 0 1.5rem var(--button-glow-spread) var(--brand);

				&:hover {
					box-shadow: 0 0 3rem calc(var(--button-glow-spread) * 2) var(--brand);
				}
			}
			.staff {
				display: flex;
				flex-direction: column;
				align-items: center;

				.seperator {
					display: flex;
					margin-bottom: 2rem;
					text-align: center;
					justify-content: center;
					align-items: center;
					:first-child,
					:last-child {
						height: 1px;
						width: 5rem;
						background-color: var(--text);
						margin: 0 0.5rem;
					}
				}
			}
		}
	}
</style>
