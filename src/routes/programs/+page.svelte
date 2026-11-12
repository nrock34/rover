<script>
    import { page, navigating } from "$app/state";
    import DirectoryPageShell from "$lib/components/directory/DirectoryPageShell.svelte";
    import { createDirectoryNavigation } from "$lib/components/directory/directory-navigation.svelte.js";
    import ProgramsViewAll from "$lib/components/programs-page/ProgramsViewAll.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Search } from "lucide-svelte";

    let { data } = $props();
    const directory = createDirectoryNavigation(() => page.url);
</script>

<svelte:head>
    <title>Browse Programs - RomeWithMe</title>
    <meta name="description" content="Compare study abroad programs by destination, duration, cost, and academic focus." />
</svelte:head>

<DirectoryPageShell
    variant="programs"
    kicker=""
    title="Explore All Study Abroad Programs"
    description="Your world. Your classroom. Your future. Discover life-changing programs in inspiring destinations and gain a global perspective that lasts a lifetime."
    image="/landing-test/rome-sunset.webp"
    fallbackImage="/landing-test/rome-street.webp"
    imageAlt="Students overlooking Rome at sunset"
    imagePosition="center 48%"
    contentId="programs"
>
    {#snippet search()}
        <label class="sr-only" for="program-hero-search">Search programs</label>
        <div class="relative rounded-lg border border-[#123e72]/10 bg-white shadow-[0_8px_24px_rgb(18_62_114/0.12)]">
            <Search class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#123e72]" aria-hidden="true" />
            <Input id="program-hero-search" type="text" placeholder="Search programs, destinations, or subjects..." value={directory.searchQuery} oninput={(event) => directory.search(event.target.value)} class="h-12 border-0 bg-transparent pl-12 text-sm text-[#123e72] shadow-none placeholder:text-[#123e72]/50" />
        </div>
    {/snippet}

    {#if directory.error}<p role="alert">{directory.error}</p>{/if}
    <ProgramsViewAll
        loading={Boolean(navigating.to)}
        results={data.results}
        pageInfo={data.pageInfo}
        filterOptions={data.filterOptions}
        filters={data.filters}
        onFilterChange={directory.filter}
        onReset={directory.reset}
        onPageChange={directory.page}
    />
</DirectoryPageShell>
