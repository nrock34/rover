<script>
 import { untrack } from 'svelte';
 import ResilientImage from '$lib/components/shared/ResilientImage.svelte';
 import { navigating } from '$app/state';
 import { LoaderCircle, Search, SlidersHorizontal } from 'lucide-svelte';
 import PostcardDirectoryCard from '$lib/components/postcards/PostcardDirectoryCard.svelte';
 import PostcardPagination from '$lib/components/postcards/PostcardPagination.svelte';
 import { Button } from '$lib/components/ui/button';
 import { Input } from '$lib/components/ui/input';
 import * as Select from '$lib/components/ui/select';
 let { data } = $props();
 const directory = $derived(data.directory);
 const basePath = $derived(data.previewPath ?? '/postcards');
 const isLoading = $derived(Boolean(navigating.to?.url.pathname === basePath));
 const sortOptions = [{value:'newest',label:'Newest'},{value:'-like_count',label:'Most liked'},{value:'-views',label:'Most viewed'},{value:'-comment_count',label:'Most discussed'},{value:'-updated_at',label:'Recently updated'}];
 let selectedSort = $state(untrack(() => data.directory.filters.sortBy || 'newest'));
 $effect(() => { selectedSort = directory.filters.sortBy || 'newest'; });
 const selectedSortLabel = $derived(sortOptions.find(option => option.value === selectedSort)?.label ?? 'Newest');
 const hasFilters = $derived(Boolean(directory.filters.q || directory.filters.category || directory.filters.tag || directory.filters.sortBy));
</script>
<svelte:head>
    <title>Travel Postcards & Study Abroad Stories | RomeWithMe</title>
    <meta name="description" content="Explore first-hand travel and study abroad stories from the RomeWithMe community. Search postcards by topic, author, category, or tag." />
    <link rel="canonical" href={data.canonicalUrl} />
    <meta property="og:title" content="Travel Postcards & Study Abroad Stories | RomeWithMe" />
    <meta property="og:description" content="Explore first-hand travel and study abroad stories from the RomeWithMe community." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={data.canonicalUrl} />
</svelte:head>
<div class="postcards-directory">
 <header class="postcards-header">
  <div class="app-shell postcards-heading">
   <div class="postcards-intro">
    <h1>Postcards <span>from abroad</span></h1>
    <p>Faraway places. Familiar feelings. Explore stories, discoveries, and everyday life through the eyes of our community.</p>
    <label class="sr-only" for="postcard-search">Search</label>
    <div class="postcards-hero-search">
     <Search aria-hidden="true" />
     <Input id="postcard-search" form="postcards-filter-form" name="q" type="text" value={directory.filters.q} placeholder="Find a story, a place, or a familiar feeling…" maxlength="120" />
     <Button type="submit" form="postcards-filter-form" disabled={isLoading}>Search</Button>
    </div>
   </div>
   <div class="postcards-memories" aria-hidden="true">
    <figure class="postcards-memory-back"><ResilientImage src="/landing-test/venice-canal.webp" fallbackSrc={null} alt="" class="postcards-memory-photo" /><figcaption>A detour through Venice</figcaption></figure>
    <figure class="postcards-memory-front"><ResilientImage src="/landing-test/rome-street.webp" fallbackSrc={null} alt="" class="postcards-memory-photo" /><figcaption>With love, from Rome</figcaption></figure>
   </div>
  </div>
 </header>
 <div class="app-shell postcards-body">
  <form id="postcards-filter-form" method="GET" action={basePath} class="postcards-filters" aria-label="Filter postcards">
   <div class="postcards-filter-heading"><SlidersHorizontal aria-hidden="true" /><h2>Explore the collection</h2></div>
            <div class="postcards-filter-fields">
                <label class="grid gap-1.5 text-sm font-medium" for="postcard-category">
                    Category
                    <Input id="postcard-category" name="category" value={directory.filters.category} list="postcard-categories" placeholder="Any category" maxlength="48" />
                    <datalist id="postcard-categories">
                        {#each directory.availableCategories as category}<option value={category}></option>{/each}
                    </datalist>
                </label>

                <label class="grid gap-1.5 text-sm font-medium" for="postcard-tag">
                    Tag
                    <Input id="postcard-tag" name="tag" value={directory.filters.tag} list="postcard-tags" placeholder="Any tag" maxlength="48" />
                    <datalist id="postcard-tags">
                        {#each directory.availableTags as tag}<option value={tag}></option>{/each}
                    </datalist>
                </label>

                <div class="grid min-w-0 gap-1.5">
                    <label class="text-xs font-medium" for="postcard-sort">Sort by</label>
                    <input type="hidden" name="sort_by" value={selectedSort === 'newest' ? '' : selectedSort} />
                    <Select.Root type="single" bind:value={selectedSort}>
                        <Select.Trigger id="postcard-sort" class="w-full">{selectedSortLabel}</Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                {#each sortOptions as option}<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>{/each}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="flex gap-2">
                    <Button type="submit" disabled={isLoading} class="postcards-apply">
                        {#if isLoading}<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />{/if}
                        Apply
                    </Button>
                    {#if directory.filters.q || directory.filters.category || directory.filters.tag || directory.filters.sortBy}
                        <Button href={basePath} variant="ghost">Clear</Button>
                    {/if}
                </div>
            </div>

  </form>
  <section aria-label="Postcard results" aria-busy={isLoading}>
   <div class="postcards-results-heading">
    <h2>{hasFilters ? 'Matching postcards' : 'The postcard collection'} <span>{directory.count} {directory.count === 1 ? 'story' : 'stories'}</span></h2>
    {#if directory.totalPages > 1}<p>Page {directory.page} of {directory.totalPages}</p>{/if}
   </div>
   {#if isLoading}<p role="status" class="sr-only">Loading postcards…</p>{/if}
   {#if directory.results.length}
    <div class="postcards-story-grid" class:postcards-loading={isLoading}>
     {#each directory.results as postcard (postcard.id)}<PostcardDirectoryCard {postcard} {basePath} />{/each}
    </div>
    <PostcardPagination currentPage={directory.page} totalPages={directory.totalPages} filters={directory.filters} {basePath} />
   {:else}
    <div class="postcards-empty"><h3>No postcards found</h3><p>{hasFilters ? 'Try a different search or clear your filters to explore the collection.' : 'New stories will appear here when the community shares them.'}</p>{#if hasFilters}<Button href={basePath} variant="outline">Clear filters</Button>{/if}</div>
   {/if}
  </section>
 </div>
</div>
<style>
 .postcards-directory { background:color-mix(in srgb,var(--secondary) 10%,var(--background));padding-bottom:2.5rem; }
 .postcards-header { border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--secondary) 40%,var(--background));overflow:hidden; }
 .postcards-heading { display:grid;grid-template-columns:1.2fr 1fr;align-items:center;gap:3rem;padding-top:2.5rem;padding-bottom:3.5rem; }
 h1 { font-family:var(--font-display);font-size:clamp(2.4rem,4vw,3.5rem);font-weight:650;line-height:1.1;max-width:34rem; }
 h1 span { display:block;font-family:var(--font-display);font-weight:500;color:var(--accent-foreground);font-size:1em;font-style:italic;margin-top:.2rem; }
 .postcards-heading p { margin-top:1rem;font-size:.9rem;line-height:1.6;max-width:31rem;color:color-mix(in srgb,var(--foreground) 80%,var(--background)); }
 .postcards-hero-search { display:flex;align-items:center;gap:.6rem;margin-top:1.25rem;padding:.4rem .5rem .4rem .85rem;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card);box-shadow:var(--shadow-sm);max-width:33rem; }
 .postcards-hero-search > :global(svg) { width:1.1rem;height:1.1rem;flex-shrink:0;color:var(--accent-foreground); }
 .postcards-hero-search :global(input) { padding:0;min-width:0;border:0;box-shadow:none;background:transparent;font-size:.85rem; }
 .postcards-hero-search :global(button) { box-shadow:none;background:color-mix(in srgb,var(--primary) 80%,var(--foreground));color:var(--primary-foreground);font-size:.8rem; }
 .postcards-memories { position:relative;min-height:16rem;max-width:32rem;width:100%;justify-self:end; }
 .postcards-memories figure { position:absolute;width:64%;padding:.5rem;border:1px solid var(--border);background:var(--card);box-shadow:var(--shadow-sm); }
 .postcards-memory-back { left:0;top:0;transform:rotate(-7deg); }
 .postcards-memory-front { right:0;top:2.5rem;transform:rotate(6deg); }
 .postcards-memories :global(.postcards-memory-photo) { width:100%;aspect-ratio:3/2;object-fit:cover; }
 .postcards-memories figcaption { padding:.4rem .2rem .1rem;font-family:var(--font-display);font-size:1rem;font-style:italic;color:var(--foreground);text-align:center; }
 .postcards-body { position:relative;margin-top:-1.35rem; }
 .postcards-filters { padding:1rem;border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm); }
 .postcards-filter-heading { display:flex;align-items:center;gap:.45rem;margin-bottom:.75rem; }
 .postcards-filter-heading :global(svg) { width:1rem;height:1rem;color:var(--accent-foreground); }
 .postcards-filter-heading h2 { font-size:.85rem;font-weight:600; }
 .postcards-filter-fields { display:grid;grid-template-columns:1fr 1fr 1.1fr auto;gap:.75rem;align-items:end; }
 .postcards-filter-fields label { min-width:0;font-size:.75rem; }
 .postcards-filter-fields :global(input) { height:2.25rem;font-size:.8rem;box-shadow:none; }
 .postcards-filter-fields :global(button),.postcards-filter-fields :global(a[data-slot="button"]) { height:2.25rem;font-size:.8rem;box-shadow:none; }
 .postcards-filter-fields :global(.postcards-apply) { background:color-mix(in srgb,var(--primary) 80%,var(--foreground));color:var(--primary-foreground); }
 .postcards-results-heading { display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding-block:1.25rem .85rem; }
 .postcards-results-heading h2 { font-size:1rem;font-weight:600;display:flex;align-items:baseline;gap:.65rem; }
 .postcards-results-heading h2 span,.postcards-results-heading p { font-size:.8rem;font-weight:400;color:var(--muted-foreground); }
 .postcards-story-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5rem; }
 .postcards-loading { opacity:.6; }
 .postcards-empty { padding:3rem 1rem;text-align:center;border:1px solid var(--border);border-radius:var(--radius-xl); }
 .postcards-empty h3 { font-size:1.1rem;font-weight:600; }
 .postcards-empty p { margin:.5rem auto 1rem;max-width:30rem;font-size:.9rem;color:var(--muted-foreground); }
 .postcards-directory :global(a:focus-visible),.postcards-directory :global(button:focus-visible),.postcards-directory :global(input:focus-visible) { outline:2px solid var(--ring);outline-offset:3px; }
 @media(max-width:1100px) { .postcards-heading { gap:1.5rem; } .postcards-memories { min-height:14rem; } .postcards-story-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
 @media(max-width:767px) { .postcards-heading { grid-template-columns:1fr;padding-top:1.75rem;gap:1.25rem;padding-bottom:3rem; } .postcards-memories { min-height:12rem;max-width:24rem;justify-self:center; } .postcards-memories figure { width:58%; } .postcards-memories figcaption { font-size:1.05rem; } .postcards-heading p { margin-top:.75rem; } .postcards-filter-fields { grid-template-columns:repeat(2,minmax(0,1fr)); } }
 @media(max-width:600px) { .postcards-story-grid { grid-template-columns:minmax(0,1fr); } .postcards-filter-fields > div:last-child { align-self:end; } }
</style>
