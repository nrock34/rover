<script>
    import { ArrowRight, BookOpen, Building2, Calendar, CalendarClock, DollarSign, FileCheck, GraduationCap, MapPin, Tags, X } from "lucide-svelte";
    import DirectoryFilterBar from "$lib/components/directory/DirectoryFilterBar.svelte";
    import DirectoryFilterSelect from "$lib/components/directory/DirectoryFilterSelect.svelte";
    import DirectorySupportRail from "$lib/components/directory/DirectorySupportRail.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Select from "$lib/components/ui/select";
    import DirectoryPagination from "$lib/components/directory/DirectoryPagination.svelte";
    import ScholarshipsView from "./ScholarshipsView.svelte";
    import { SCHOLARSHIP_AMOUNT_OPTIONS, SCHOLARSHIP_DEADLINE_OPTIONS, SCHOLARSHIP_SORT_OPTIONS } from "./scholarship-directory.js";

    let { scholarshipItems = [], pageInfo, options, filters = {}, loading = false, onFilterChange, onReset, onPageChange } = $props();
    const selectedSort = $derived(filters.sort_by || "featured");
    const selectedSortLabel = $derived(SCHOLARSHIP_SORT_OPTIONS.find(option => option.id === selectedSort)?.name ?? "Featured first");
    const filterControls = $derived([
        { key: "category", label: "Category", icon: Tags, options: options.categories },
        { key: "country", label: "Destination", icon: MapPin, options: options.countries },
        { key: "provider", label: "Provider", icon: Building2, options: options.providers },
        { key: "amount", label: "Award amount", icon: DollarSign, options: SCHOLARSHIP_AMOUNT_OPTIONS },
        { key: "deadline", label: "Deadline", icon: Calendar, options: SCHOLARSHIP_DEADLINE_OPTIONS },
        { key: "level", label: "Education level", icon: GraduationCap, options: options.levels },
        { key: "field", label: "Field of study", icon: BookOpen, options: options.fields }
    ]);
    const activeFilters = $derived([
        ...(filters.q ? [{ key: "q", label: `“${filters.q}”` }] : []),
        ...filterControls.filter(control => filters[control.key] && filters[control.key] !== "all").map(control => ({
            key: control.key,
            label: control.options.find(option => option.id === filters[control.key])?.name ?? filters[control.key]
        }))
    ]);
    const resultStart = $derived(scholarshipItems.length ? (pageInfo.page - 1) * pageInfo.pageSize + 1 : 0);
    const resultEnd = $derived(scholarshipItems.length ? resultStart + scholarshipItems.length - 1 : 0);
    const compactLabels = { category: "Type", country: "Place", provider: "Org.", amount: "Award", deadline: "Due", level: "Level", field: "Field" };
</script>

<div>
    <DirectoryFilterBar activeCount={activeFilters.length} {onReset}>
        {#each filterControls as control (control.key)}
            <DirectoryFilterSelect label={control.label} compactLabel={compactLabels[control.key]} icon={control.icon} options={control.options} value={filters[control.key] || "all"} onValueChange={value => onFilterChange(control.key, value)} />
        {/each}
    </DirectoryFilterBar>

    {#if activeFilters.length > 0}
        <div class="mt-3 flex flex-wrap gap-2">
            {#each activeFilters as filter (filter.key)}
                <Button variant="outline" size="sm" aria-label={`Remove filter: ${filter.label}`} disabled={loading} onclick={() => onFilterChange(filter.key, "all")}>
                    {filter.label}<X class="size-3" aria-hidden="true" />
                </Button>
            {/each}
        </div>
    {/if}

    <div class="mt-4 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section class="min-w-0 rounded-xl border border-[#123e72]/10 bg-white p-4 shadow-[0_5px_18px_rgb(18_62_114/0.06)]" aria-labelledby="directory-results-heading" aria-busy={loading}>
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p role="status" id="directory-results-heading" tabindex="-1" class="scroll-mt-28 text-xs text-[#123e72]/65">{#if loading}Updating scholarships…{:else}Showing <strong class="text-[#123e72]">{resultStart}–{resultEnd}</strong> of <strong class="text-[#123e72]">{pageInfo.total}</strong> scholarships{/if}</p>
                <div class="flex items-center gap-2">
                    {#if pageInfo.pageCount > 1}<span class="hidden text-xs text-[#123e72]/55 sm:inline">Page {pageInfo.page} of {pageInfo.pageCount}</span>{/if}
                    <span class="text-xs text-[#123e72]/55">Sort by</span>
                    <Select.Root type="single" value={selectedSort} onValueChange={value => onFilterChange("sort_by", value)}>
                        <Select.Trigger aria-label="Sort scholarships" class="h-9 min-w-36 border-[#123e72]/10 bg-white text-xs text-[#123e72]">{selectedSortLabel}</Select.Trigger>
                        <Select.Content><Select.Group>{#each SCHOLARSHIP_SORT_OPTIONS as option}<Select.Item value={option.id} label={option.name}>{option.name}</Select.Item>{/each}</Select.Group></Select.Content>
                    </Select.Root>
                </div>
            </div>

            {#if scholarshipItems.length > 0}
                <ScholarshipsView scholarships={scholarshipItems} />
                <DirectoryPagination {pageInfo} {loading} {onPageChange} />
            {:else}
                <div class="grid min-h-56 place-items-center rounded-lg border border-dashed border-[#123e72]/15 text-center"><div><h3 class="text-lg font-semibold text-[#123e72]">{activeFilters.length ? "No scholarships match those filters" : "No scholarships available yet"}</h3><p class="mt-2 text-sm text-muted-foreground">{activeFilters.length ? "Try another category, destination, amount, or deadline window." : "Check back for new funding opportunities."}</p></div></div>
            {/if}
        </section>

        <DirectorySupportRail label="Scholarship planning resources">
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <CalendarClock class="size-6 text-primary" />
                <h3 class="mt-3 text-sm font-semibold text-[#123e72]">Watch the deadline</h3>
                <p class="mt-2 text-xs leading-5 text-[#123e72]/65">Sort by deadline and prioritize applications that close soon.</p>
            </div>
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <FileCheck class="size-6 text-primary" />
                <h3 class="mt-3 text-sm font-semibold text-[#123e72]">Application checklist</h3>
                <p class="mt-2 text-xs leading-5 text-[#123e72]/65">Review eligibility, required documents, and award terms before applying.</p>
            </div>
            <div class="rounded-xl border border-[#123e72]/10 bg-white p-5 shadow-[0_5px_18px_rgb(18_62_114/0.06)]">
                <GraduationCap class="size-7 text-primary" />
                <h3 class="mt-3 text-sm font-semibold text-[#123e72]">Still choosing a program?</h3>
                <p class="mt-1 text-xs leading-5 text-[#123e72]/65">Compare study abroad programs before matching funding.</p>
                <Button href="/programs" variant="ghost" class="mt-2 h-auto px-0 text-xs text-primary">Explore programs <ArrowRight class="size-4" /></Button>
            </div>
        </DirectorySupportRail>
    </div>
</div>
