<script>
    import { page, navigating } from "$app/state";
    import { createDirectoryNavigation } from "$lib/components/directory/directory-navigation.svelte.js";
    import DirectoryPageShell from "$lib/components/directory/DirectoryPageShell.svelte";
    import ScholarshipsView from "$lib/components/scholarships-page/Scholarships.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Search } from "lucide-svelte";

    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
    const directory = createDirectoryNavigation(() => page.url);
</script>

<svelte:head>
    <title>Study Abroad Scholarships | RomeWithMe</title>
    <meta name="description" content="Discover scholarships and funding opportunities for your study abroad journey." />
</svelte:head>

<DirectoryPageShell
    variant="scholarships"
    kicker=""
    title="Explore All Study Abroad Scholarships"
    description="Find funding opportunities that can make your study abroad plans possible. Compare awards, deadlines, destinations, and eligibility requirements in one place."
    image="/landing-test/origin-collage.webp"
    fallbackImage="/landing-test/rome-sunset.webp"
    imageAlt="A collage of study abroad memories and planning notes"
    imagePosition="center 45%"
    contentId="scholarships"
>
    {#snippet search()}
        <label class="sr-only" for="scholarship-hero-search">Search scholarships</label>
        <div class="relative rounded-lg border border-[#123e72]/10 bg-white shadow-[0_8px_24px_rgb(18_62_114/0.12)]">
            <Search class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#123e72]" aria-hidden="true" />
            <Input id="scholarship-hero-search" type="text" placeholder="Search scholarships, providers, or destinations..." value={directory.searchQuery} oninput={(event) => directory.search(event.target.value)} class="h-12 border-0 bg-transparent pl-12 text-sm text-[#123e72] shadow-none placeholder:text-[#123e72]/50" />
        </div>
    {/snippet}
    {#if directory.error}<p role="alert">{directory.error}</p>{/if}
    <ScholarshipsView
        scholarshipItems={data.scholarshipItems}
        pageInfo={data.pageInfo}
        options={data.filterOptions}
        filters={data.filters}
        loading={Boolean(navigating.to)}
        onFilterChange={directory.filter}
        onReset={directory.reset}
        onPageChange={directory.page}
    />
</DirectoryPageShell>
