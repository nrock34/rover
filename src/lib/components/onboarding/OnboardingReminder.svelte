<script>
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { buildOnboardingRedirectUrl } from "$lib/auth/redirect.js";

	let { userId = "member" } = $props();
	let ready = $state(false);
	let dismissed = $state(false);
	const storageKey = $derived(`rwm:onboarding-reminder:${userId}`);
	const onboardingHref = $derived(buildOnboardingRedirectUrl(page.url));

	onMount(() => {
		try {
			dismissed = sessionStorage.getItem(storageKey) === "dismissed";
		} catch {
			// The reminder still works when browser storage is unavailable.
		}
		ready = true;
	});

	function dismiss() {
		dismissed = true;
		try {
			sessionStorage.setItem(storageKey, "dismissed");
		} catch {
			// Dismiss for this page even when browser storage is unavailable.
		}
	}
</script>

{#if ready && !dismissed}
	<aside class="onboarding-reminder" aria-labelledby="onboarding-reminder-title">
		<div class="reminder-heading">
			<h2 id="onboarding-reminder-title">Finish setting up your account</h2>
			<button type="button" onclick={dismiss}>Dismiss</button>
		</div>
		<p>Complete onboarding to join the community, explore scholarships, and view member profiles.</p>
		<a href={onboardingHref}>Continue onboarding</a>
	</aside>
{/if}

<style>
	.onboarding-reminder {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 45;
		width: min(22rem, calc(100vw - 2rem));
		padding: 1rem;
		border: 1px solid var(--border);
		border-left: 3px solid var(--primary);
		border-radius: var(--radius);
		background: var(--card);
		color: var(--card-foreground);
		box-shadow: var(--shadow-md);
	}
	.reminder-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
	h2 { margin: 0; font-size: .875rem; font-weight: 600; line-height: 1.4; }
	p { margin: .5rem 0 .75rem; color: var(--muted-foreground); font-size: .875rem; line-height: 1.5; }
	button { flex-shrink: 0; border: 0; background: none; color: var(--muted-foreground); font-size: .875rem; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
	a { color: var(--primary); font-size: .875rem; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
	button:focus-visible, a:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }
</style>
