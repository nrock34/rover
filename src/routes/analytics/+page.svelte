<script>
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  let { data } = $props();
  let snapshot = $state(null);
  let role = $state('');
  let contentType = $state('');
  let problem = $state('');
  let pending = $state(false);
  let mounted = $state(false);
  let requestId = 0;
  async function refresh() {
    const current = ++requestId;
    const query = new URLSearchParams();
    if (role) query.set('role', role); if (contentType) query.set('contentType', contentType);
    pending = true;
    try {
      const response = await fetch(`/api/analytics/snapshot?${query}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Live presence is temporarily unavailable.');
      const value = await response.json();
      if (current === requestId) { snapshot = value; problem = ''; }
    } catch (error) { if (current === requestId) problem = error instanceof Error ? error.message : 'Unable to load presence.'; }
    finally { if (current === requestId) pending = false; }
  }
  $effect(() => { role; contentType; if (mounted) void refresh(); });
  onMount(() => { mounted = true; const timer = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 15000); return () => { clearInterval(timer); requestId++; }; });
</script>

<svelte:head><title>Analytics | RomeWithMe</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<section class="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6" aria-labelledby="analytics-title">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 id="analytics-title" class="text-2xl font-semibold text-foreground">Analytics</h1>
    {#if data.umamiUrl}<Button variant="outline" href={data.umamiUrl} target="_blank" rel="noopener noreferrer">Open Umami reports</Button>{/if}
  </div>
  <div class="flex flex-wrap items-end gap-4">
    <label class="grid gap-1 text-sm">Role
      <select class="rounded-md border border-border bg-background px-3 py-2" bind:value={role}>
        <option value="">All roles</option>
        {#each snapshot?.roles ?? [] as value}<option value={value}>{value}</option>{/each}
      </select>
    </label>
    <label class="grid gap-1 text-sm">Content type
      <select class="rounded-md border border-border bg-background px-3 py-2" bind:value={contentType}>
        <option value="">All content</option>
        {#each ['postcard', 'program', 'scholarship', 'resource', 'community-post', 'update'] as type}<option value={type}>{type}</option>{/each}
      </select>
    </label>
    <Button variant="outline" onclick={refresh} disabled={pending}>{pending ? 'Refreshing…' : 'Refresh'}</Button>
  </div>
  <div aria-live="polite" aria-atomic="true">
    {#if problem}<p class="text-destructive" role="status">{problem} {snapshot ? 'Showing the previous snapshot.' : ''}</p>{/if}
    {#if snapshot}
      <p class="text-lg"><strong>{snapshot.totals.online}</strong> online · <strong>{snapshot.totals.active}</strong> actively engaged</p>
      <p class="text-sm text-muted-foreground">Online includes background tabs seen within {snapshot.expiresAfterMs / 1000} seconds. Active requires a focused page and recent activity, with a two-minute reading grace. Multiple tabs count once per visitor.</p>
    {/if}
  </div>
  {#if snapshot?.capped}<p class="text-destructive">The presence scan limit was reached. These counts are partial.</p>{/if}
  <section aria-labelledby="viewers-title" class="space-y-3">
    <h2 id="viewers-title" class="text-lg font-semibold">Current viewers by page</h2>
    <div class="overflow-x-auto rounded-md border border-border">
      <table class="w-full text-left text-sm">
        <thead class="bg-muted"><tr><th scope="col" class="p-3">Page</th><th scope="col" class="p-3">Type</th><th scope="col" class="p-3">Online</th><th scope="col" class="p-3">Active</th></tr></thead>
        <tbody>{#each snapshot?.pages ?? [] as item}<tr class="border-t border-border"><th scope="row" class="p-3 font-normal"><a class="underline underline-offset-4" href={item.path}>{item.path}</a></th><td class="p-3">{item.content?.type ?? 'Page'}</td><td class="p-3 tabular-nums">{item.online}</td><td class="p-3 tabular-nums">{item.active}</td></tr>{:else}<tr><td colspan="4" class="p-4 text-muted-foreground">{snapshot ? 'No visitors match these filters.' : 'Loading presence…'}</td></tr>{/each}</tbody>
      </table>
    </div>
  </section>
  <section aria-labelledby="trending-title" class="space-y-3">
    <h2 id="trending-title" class="text-lg font-semibold">Popular content</h2>
    <p class="text-sm text-muted-foreground">Site-wide views, independent of the role filter. Recent windows use minute buckets and may lag by 30 seconds. Historical role breakdowns, geography, funnels and journeys are in Umami.</p>
    <div class="overflow-x-auto rounded-md border border-border">
      <table class="w-full text-left text-sm">
        <thead class="bg-muted"><tr><th scope="col" class="p-3">Page</th><th scope="col" class="p-3">Last 15 min</th><th scope="col" class="p-3">Previous 15 min</th><th scope="col" class="p-3">Last hour</th><th scope="col" class="p-3">Last day</th></tr></thead>
        <tbody>{#each snapshot?.trending ?? [] as item}<tr class="border-t border-border"><th scope="row" class="p-3 font-normal"><a class="underline underline-offset-4" href={item.path}>{item.path}</a></th><td class="p-3 tabular-nums">{item.current}</td><td class="p-3 tabular-nums">{item.previous}</td><td class="p-3 tabular-nums">{item.hour}</td><td class="p-3 tabular-nums">{item.day}</td></tr>{:else}<tr><td colspan="5" class="p-4 text-muted-foreground">No views recorded in this period.</td></tr>{/each}</tbody>
      </table>
    </div>
  </section>
</section>
