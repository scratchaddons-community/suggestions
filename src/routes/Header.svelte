<script lang="ts">
	import { browser } from "$app/environment";
	import { goto, preloadData } from "$app/navigation";
	import { page } from "$app/state";
	import { toSentenceCase } from "$lib";
	import { Sun, Moon } from "$lib/icons";
	import Add from "$lib/icons/Add.svelte";
	import Profile from "$lib/icons/Profile.svelte";
	import icon from "$lib/images/icon.svg";

	const { session }: { session: App.Locals["session"] } = $props();

	let theme: "dark" | "light" = $state()!;
	let setTheme: Function = $state()!;
	const suggestionsPage = $state(page.url.searchParams.get("page") || undefined);

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
</script>

<header>
	<nav>
		<a href="/" class="icon" data-sveltekit-reload={typeof suggestionsPage !== "undefined"}>
			<img src={icon} alt="Scratch Addons" width="150" height="150" />
			<span>Scratch Addons Suggestions</span>
		</a>

		<div class="right">
			{#if !session}
				<div class="user">
					<a href="/login" class="login button">Login</a>
				</div>
			{:else}
				<div class="user">
					<a href="/account" class="profile button">
						<Profile />
					</a>
				</div>
			{/if}

			<div class="add">
				<a href="/add" class="plus button">
					<Add />
				</a>
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
			border: none;
			padding: 0.5rem;
			margin-right: 0.5rem;
			display: flex;
			justify-content: center;
			align-items: center;

			div {
				height: 1.5rem;
			}
		}

		.plus,
		.profile,
		.theme-toggle {
			&:not(div) {
				display: flex;
				justify-content: center;
				align-items: center;
			}

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
</style>
