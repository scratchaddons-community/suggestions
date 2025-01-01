<script lang="ts">
	import { fade } from "svelte/transition";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<div class="privacy" in:fade|global={{ duration: 200, delay: 300 }}>
	<h1>Privacy Policy</h1>

	<div class="about-you">
		<h2>Data collected about you</h2>
		<p>
			If you are a member of the community, you sign in with your Scratch Account. Scratch Auth
			provides us with the following data about you:
		</p>
		<ul>
			<li>Your username</li>
			<li>Confirmation that you have access to said username</li>
		</ul>

		<p>
			That is all. We can not access your email address or password, your private projects, or
			anything else not public on Scratch. In the future, we may use your username to automatically
			fetch your profile picture to be displayed on this website.
		</p>

		<p>
			If you are a member of the development team, or a staff member, you sign in with Github OAuth.
			With this method of signing in, we are given more information, such as:
		</p>
		<ul>
			<li>Your Github username</li>
			<li>Your Github account ID</li>
			<li>Your Github avatar</li>
			<li>APIs to fetch your followers, following, repos, and more</li>
			<li>Your Github display name</li>
			<li>When your profile was created</li>
			<li>If you have 2FA set up (You should)</li>
			<li>
				And more, as per the <code>read:user</code>
				<a
					href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps"
					target="_blank"
				>
					scope</a
				>
			</li>
		</ul>
		<p>
			The only data we store (and as such the only data that we can see at all) is your username,
			display name, and ID. The rest is ignored on the server side, and is not sent to any database,
			log, or client. Again, we do not have access to your email, password, or anything private.
		</p>

		<h2>Cookies and local storage</h2>
		<p>
			Besides the data outlined above, we also use your browser's cookies and local storage to store
			some data about you.
		</p>
		<p>
			The data stored in your cookies is simply the current session ID that tells us "Hey, this
			person is logged in already, don't make them log in again and let them access their stuff." If
			we did not store this, you would need to log in every time you visited this website, and even
			every time you navigated to another page.
		</p>

		<p>
			The data stored in your local storage is simply the current theme. It is quite literally a
			simple string, either "dark" or "light". This is set when you first visit the website based
			off your preferred theme (set by your OS or browser), and then changes whenever you manually
			change the theme.
		</p>

		<p>
			If you would like to simply check for yourself, all the code is public, and can be found via
			the link in the footer.
		</p>

		<h2>Third-Party Services</h2>
		<p>We use a few third-party services to improve your experience on this site:</p>

		<ul>
			<li>
				<strong>Vercel Analytics:</strong> We use Vercel Analytics to track website performance and usage
				patterns. This helps us understand how visitors use the site and identify areas for improvement.
				The data collected by Vercel Analytics is aggregated and anonymized, so no personally identifiable
				information (PII) is shared.
			</li>
			<li>
				<strong>Cloudinary:</strong> We use Cloudinary to host and serve images on the site. While this
				service helps ensure fast and reliable delivery of images, no personal data is stored or shared
				with Cloudinary.
			</li>
			<li>
				<strong>Neon:</strong> We use Neon to manage our database, which securely stores limited user
				data (like usernames, IDs, and display names), or suggestion-related data. Neon is a cloud-based
				database platform that prioritizes security and reliability. The data stored is minimal and strictly
				necessary for the functionality of the site.
			</li>
		</ul>

		<p>These services are governed by their own privacy policies, which you can review here:</p>
		<ul>
			<li>
				<a href="https://vercel.com/legal/privacy-policy" target="_blank">Vercel Privacy Policy</a>
			</li>
			<li>
				<a href="https://cloudinary.com/privacy" target="_blank">Cloudinary Privacy Policy</a>
			</li>
			<li>
				<a href="https://neon.tech/privacy-policy" target="_blank">Neon Privacy Policy</a>
			</li>
		</ul>

		<h2>Contact Us</h2>
		<p>
			If you have any questions or concerns about our privacy policy, please contact us. As of now,
			this website is only being worked on by <a
				href="https://github.com/Jazza-231/"
				target="_blank"
				>Jazza
			</a>. As such, if you have any questions, you can email me at
			<a href="mailto:admin@jazza.dev"> admin@jazza.dev </a>.
		</p>
	</div>
</div>

<style>
	.privacy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		div {
			width: 50rem;
			max-width: 90%;
		}
	}
</style>
