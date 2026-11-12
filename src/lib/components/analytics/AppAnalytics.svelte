<script>
  import { page } from '$app/state';
  import { AnalyticsProvider } from '@nrock/umami-svelte';
  import { analyticsContent } from '$lib/analytics/content.js';
  let { analytics, children } = $props();
  const descriptor = $derived({ path: page.url.pathname, content: page.status >= 200 && page.status < 300 ? analyticsContent(page.url.pathname) : undefined });
</script>

<AnalyticsProvider config={analytics?.config ?? { enabled: false }} identity={analytics?.identity} page={descriptor}>
  {@render children()}
</AnalyticsProvider>
