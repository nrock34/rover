<script>
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner"
    import { setTokenState } from '$lib/stores/jwt.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
    import { setContext } from 'svelte';
    import { page } from "$app/state";
    import Navigation from '$lib/components/layout/navigation.svelte';
	import ContentServiceStatusBanner from '$lib/components/layout/ContentServiceStatusBanner.svelte';
	import OnboardingReminder from '$lib/components/onboarding/OnboardingReminder.svelte';
	import { getSiteChrome } from '$lib/components/layout/site-chrome.js';
	import AppAnalytics from '$lib/components/analytics/AppAnalytics.svelte';

	let { children, data } = $props();

	setContext('config', data.config);

	const tokenState = setTokenState(data.acs_tkn)
    const chrome = $derived(getSiteChrome(page.url.pathname));
	const contentServiceStatus = $derived(page.data.contentService ?? data.contentService);

	$effect(() => {
		tokenState.syncToken(data.acs_tkn)
	})

</script>

<Toaster position="top-right" />

<svelte:head>
	<title>RomeWithMe - Study Abroad Community</title>
	<meta property="og:title" content="RomeWithMe – Connect, Share & Explore Abroad" />
	<meta property="og:description" content="RomeWithMe is a platform for students and travelers to share experiences, find community, and stay connected while abroad." />
	<meta property="og:image" content="https://romewithme.com/og-image.png" />
	<meta property="og:url" content="https://romewithme.com" />
	<meta property="og:type" content="website" />
</svelte:head>

<AppAnalytics analytics={data.analytics}>
<div class="min-h-screen flex flex-col">
	{#if chrome.header}
		<header class="sticky top-0 z-50 w-full">
			<Navigation
				auth={data.auth}
				viewer={data.viewer}
				variant={chrome.header}
				pathname={page.url.pathname}
			/>
		</header>
	{/if}

	{#if chrome.statusBanner}
		<ContentServiceStatusBanner status={contentServiceStatus} />
	{/if}

	<main class="flex-grow">
		{@render children()}
	</main>

	{#if data.auth?.isAuthenticated && !data.auth?.isOnboarded && chrome.header && !page.url.pathname.startsWith('/develop-preview')}
		<OnboardingReminder userId={String(data.auth.claims?.userId ?? data.auth.claims?.id ?? data.auth.claims?.sub ?? 'member')} />
	{/if}

	{#if chrome.footer}
		<div class="scrollerFooter shrink-0">
			<Footer />
		</div>
	{/if}
</div>
</AppAnalytics>
