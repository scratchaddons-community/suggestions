<script lang="ts">
	import { browser } from "$app/environment";
	import { goto, preloadData } from "$app/navigation";
	import { page } from "$app/stores";
	import { Sun, Moon } from "$lib/icons";
	import Profile from "$lib/icons/Profile.svelte";

	const { session } = $props();

	let theme: "dark" | "light" = $state()!;
	let setTheme: Function = $state()!;
	const suggestionsPage = $state($page.url.searchParams.get("page") || undefined);

	if (browser) {
		theme = localStorage.theme;

		setTheme = function (themeTo: "dark" | "light") {
			theme = themeTo;
			document.documentElement.dataset.theme = themeTo;
			localStorage.theme = themeTo;
		};
	}

	function toggleTheme() {
		setTheme(theme === "dark" ? "light" : "dark");
	}

	function login() {
		if (location.pathname !== "/login") goto("/login");
	}

	function account() {
		if (location.pathname !== "/account") goto("/account");
	}

	function preloadAccount() {
		preloadData("/account");
	}

	function preloadLogin() {
		preloadData("/login");
	}
</script>

<header>
	<nav>
		{#if typeof suggestionsPage !== "undefined"}
			<a href="/" class="icon" data-sveltekit-reload>
				<img src="/icon.svg" alt="Scratch Addons" />
				<span>Scratch Addons Suggestions</span>
			</a>
		{:else}
			<a href="/" class="icon">
				<img src="/icon.svg" alt="Scratch Addons" />
				<span>Scratch Addons Suggestions</span>
			</a>
		{/if}

		<div class="right">
			<div class="user">
				{#if session}
					<button class="profile button" onclick={account} onmouseenter={preloadAccount}>
						<Profile />
					</button>
				{:else}
					<button class="login button" onclick={login} onmouseenter={preloadLogin}>Login</button>
				{/if}
			</div>
			<button class="theme-toggle" onclick={toggleTheme}>
				<div class="sun">
					<Sun />
				</div>
				<div class="moon">
					<Moon />
				</div>
			</button>
		</div>
	</nav>
</header>

<style>
	:global {
		.sun {
			display: var(--sun-display);
		}

		.moon {
			display: var(--moon-display);
		}
	}

	header {
		display: flex;
		justify-content: center;
	}

	nav {
		background-color: var(--header);
		transition:
			background-color var(--transition-short),
			box-shadow var(--transition-short);
		height: 3.75rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: var(--header-drop-shadow);
		border-bottom-left-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
		width: 80%;

		@media (width <= 768px) {
			width: 90%;
		}

		.icon {
			display: inline-flex;
			align-items: center;
			color: var(--text-on-brand);
			text-decoration: none;
			margin: 0.1rem;

			img {
				margin: 0.1rem 0 0 0.1rem;
				height: 3.25rem;
				width: auto;
			}

			span {
				font-size: 1.2rem;

				@media (width <= 768px) {
					display: none;
				}
			}
		}
	}

	.right {
		display: flex;
		align-items: center;
		justify-content: end;
		gap: 0.5rem;

		.theme-toggle {
			background-color: var(--header);
			transition: background-color var(--transition-short);
			border: none;
			padding: 0.5rem;
			margin-right: 0.5rem;
			border-radius: 0.3rem;
			display: flex;
			justify-content: center;
			align-items: center;

			div {
				height: 1.5rem;

				:global {
					svg {
						height: 1.5rem;
						width: 1.5rem;
						path {
							fill: var(--header-theme-toggle-fill);
							transition: fill var(--transition-short);
						}
					}
				}
			}

			&:hover {
				background-color: color-mix(in srgb, white, transparent 50%);

				:global {
					svg > path {
						fill: black;
					}
				}
			}
		}

		.user {
			.profile {
				display: flex;
				justify-content: center;
				align-items: center;
				:global {
					svg {
						height: 1.5rem;
						width: 1.5rem;

						path {
							fill: var(--header-theme-toggle-fill);
							transition: fill var(--transition-short);
						}
					}
				}

				&:hover {
					:global {
						svg > path {
							fill: black;
						}
					}
				}
			}
		}
	}
</style>
