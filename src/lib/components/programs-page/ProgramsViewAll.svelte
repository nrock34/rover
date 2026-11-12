<script>
    import { ArrowRight, BookOpen, Building2, CalendarClock, Globe2, GraduationCap, Grid, Languages, List, Map, MapPin, MessageCircle } from "lucide-svelte";
    import DirectoryFilterBar from "$lib/components/directory/DirectoryFilterBar.svelte";
    import DirectoryFilterSelect from "$lib/components/directory/DirectoryFilterSelect.svelte";
    import DirectorySupportRail from "$lib/components/directory/DirectorySupportRail.svelte";
    import * as Select from "../ui/select";
    import { Button } from "../ui/button";
    import * as ToggleGroup from "../ui/toggle-group";
    import GridView from "./views-types/GridView.svelte";
    import ListView from "./views-types/ListView.svelte";
    import MapView from "./views-types/MapView.svelte";
    import DirectoryPagination from "$lib/components/directory/DirectoryPagination.svelte";

    let { loading = false, results = [], pageInfo, filterOptions, filters = {}, onFilterChange, onReset, onPageChange } = $props();
    let viewMode = $state("grid");
    const durations = [
        { id: "all", name: "Any term" },
        { id: "sem", name: "Semester program" },
        { id: "yr", name: "Full academic year" },
        { id: "sum", name: "Summer program" },
        { id: "brk", name: "Winter / spring break" },
        { id: "twowks", name: "1–2 weeks" },
        { id: "sxwks", name: "4–6 weeks" }
    ];
    const filterControls = $derived([
        { key: "country", label: "Destination", icon: MapPin, options: [{ id: "all", name: "All destinations" }, ...filterOptions.countries.map(country => ({ id: country.name, name: country.name }))] },
        { key: "provider", label: "Provider", icon: Building2, options: [{ id: "all", name: "All providers" }, ...filterOptions.providers] },
        { key: "duration", label: "Term", icon: GraduationCap, options: durations },
        { key: "subject", label: "Subject", icon: BookOpen, options: [{ id: "all", name: "All subjects" }, ...filterOptions.subjects] },
        { key: "duration_group", label: "Duration", icon: CalendarClock, options: [{ id: "all", name: "Any duration" }, { id: "short", name: "Short term" }, { id: "semester", name: "Semester" }, { id: "summer", name: "Summer" }, { id: "year", name: "Full year" }] },
        { key: "language", label: "Language", icon: Languages, options: [{ id: "all", name: "Any language" }, ...filterOptions.languages] },
        { key: "listing", label: "Listing", icon: Globe2, options: [{ id: "all", name: "All programs" }, { id: "featured", name: "Featured" }, { id: "standard", name: "Standard" }] }
    ]);
    const sortBy = $derived(filters.sort_by || "rating");
    const sortByTriggerContent = $derived(({ rating: "Featured", cost: "Cost", participants: "Participants", alphabetical: "A–Z" })[sortBy] ?? "Featured");
    const activeFilterCount = $derived(filterControls.filter(control => filters[control.key] && filters[control.key] !== "all").length + (filters.q ? 1 : 0));
    const compactLabels = { country: "Place", provider: "Org.", duration: "Term", subject: "Study", duration_group: "Length", language: "Lang.", listing: "Type" };
    const resultStart = $derived(results.length ? (pageInfo.page - 1) * pageInfo.pageSize + 1 : 0);
    const resultEnd = $derived(results.length ? resultStart + results.length - 1 : 0);
</script>

<div>
    <DirectoryFilterBar activeCount={activeFilterCount} {onReset}>
        {#each filterControls as control (control.key)}
            <DirectoryFilterSelect label={control.label} compactLabel={compactLabels[control.key]} icon={control.icon} options={control.options} value={filters[control.key] || "all"} onValueChange={value => onFilterChange(control.key, value)} />
        {/each}
    </DirectoryFilterBar>
    <div class="mt-4 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-busy={loading} aria-labelledby="directory-results-heading" class="min-w-0 rounded-xl border border-[#123e72]/10 bg-white p-4 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p id="directory-results-heading" tabindex="-1" class="scroll-mt-28 text-xs text-[#123e72]/65" role="status">{#if loading}Updating programs…{:else}Showing <strong class="text-[#123e72]">{resultStart}–{resultEnd}</strong> of <strong class="text-[#123e72]">{pageInfo.total}</strong> programs{/if}</p>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span class="text-xs text-[#123e72]/55">Sort by</span>
                    <Select.Root type="single" value={sortBy} onValueChange={value => onFilterChange("sort_by", value)}><Select.Trigger aria-label="Sort programs" class="h-9 min-w-32 border-[#123e72]/10 bg-white text-xs text-[#123e72]">{sortByTriggerContent}</Select.Trigger><Select.Content><Select.Group><Select.Item label="Featured" value="rating" /><Select.Item label="Cost" value="cost" /><Select.Item label="Participants" value="participants" /><Select.Item label="A–Z" value="alphabetical" /></Select.Group></Select.Content></Select.Root>
                    <ToggleGroup.Root variant="outline" type="single" bind:value={viewMode} class="hidden sm:flex"><ToggleGroup.Item aria-label="Grid view" value="grid"><Grid class="size-4" /></ToggleGroup.Item><ToggleGroup.Item aria-label="List view" value="list"><List class="size-4" /></ToggleGroup.Item><ToggleGroup.Item aria-label="Map view" value="map"><Map class="size-4" /></ToggleGroup.Item></ToggleGroup.Root>
                </div>
            </div>

            {#if results.length > 0}
                {#if viewMode === "grid"}<GridView {durations} sortedPrograms={results} />{:else if viewMode === "list"}<ListView {durations} sortedPrograms={results} />{:else}<MapView programs={results} />{/if}
            {:else}
                <div class="grid min-h-56 place-items-center rounded-lg border border-dashed border-[#123e72]/15 text-center"><div><h3 class="text-lg font-semibold text-[#123e72]">No programs match those filters</h3><p class="mt-2 text-sm text-muted-foreground">Try widening your search or resetting filters.</p></div></div>
            {/if}

            <DirectoryPagination {pageInfo} {loading} {onPageChange} />
        </section>

        <DirectorySupportRail label="Program planning resources">
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <h3 class="font-display text-lg font-semibold text-[#123e72]">Where will you go?</h3>
                <div class="relative my-4 grid h-28 place-items-center overflow-hidden rounded-lg bg-[#eef3f8]">
                    <Globe2 class="size-20 text-[#123e72]/16" />
                    <span class="absolute left-[27%] top-[42%] size-2 rounded-full bg-primary shadow-[0_0_0_4px_rgb(217_93_50/0.12)]"></span>
                    <span class="absolute left-[50%] top-[55%] size-2 rounded-full bg-primary shadow-[0_0_0_4px_rgb(217_93_50/0.12)]"></span>
                    <span class="absolute right-[23%] top-[38%] size-2 rounded-full bg-primary shadow-[0_0_0_4px_rgb(217_93_50/0.12)]"></span>
                </div>
                <Button href="/programs" variant="ghost" class="h-auto px-0 text-xs text-primary">View all destinations <ArrowRight class="size-4" /></Button>
            </div>
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <MessageCircle class="size-6 text-primary" />
                <p class="mt-3 text-sm leading-5 text-[#123e72]/72">“Study abroad gave me confidence, lifelong friends, and a new perspective on the world.”</p>
                <div class="mt-4 flex items-center gap-3"><div class="grid size-10 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">RM</div><div><p class="text-xs font-semibold text-[#123e72]">RomeWithMe community</p><p class="text-[0.66rem] text-[#123e72]/55">Student stories</p></div></div>
            </div>
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <GraduationCap class="size-7 text-primary" />
                <h3 class="mt-3 text-sm font-semibold text-[#123e72]">Scholarships available</h3>
                <p class="mt-1 text-xs leading-5 text-[#123e72]/65">Find funding that fits your program.</p>
                <Button href="/scholarships" variant="ghost" class="mt-2 h-auto px-0 text-xs text-primary">Explore scholarships <ArrowRight class="size-4" /></Button>
            </div>
        </DirectorySupportRail>
    </div>
</div>
