<script>
    import { ChevronsLeft, ChevronsRight } from "lucide-svelte";
    import * as Pagination from "$lib/components/ui/pagination";

    let {
        currentPage = $bindable(),
        count,
        perPage = 6,
        totalPages,
        resultsHeadingId = "scholarship-results-heading"
    } = $props();

    let previousPage = currentPage;

    $effect(() => {
        if (currentPage === previousPage) return;
        previousPage = currentPage;
        requestAnimationFrame(() => {
            document.getElementById(resultsHeadingId)?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "start"
            });
        });
    });
</script>

{#if totalPages > 1}
    <div class="mt-6 flex flex-col items-center gap-2 border-t border-[#123e72]/10 pt-5">
        <p class="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#123e72]/55">Page {currentPage} of {totalPages}</p>
        <Pagination.Root bind:page={currentPage} {count} {perPage} siblingCount={1}>
            {#snippet children({ pages, currentPage: activePage })}
                <Pagination.Content>
                    <Pagination.Item><Pagination.PrevButton><ChevronsLeft class="size-4" /></Pagination.PrevButton></Pagination.Item>
                    {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                            <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
                        {:else}
                            <Pagination.Item><Pagination.Link {page} isActive={activePage === page.value}>{page.value}</Pagination.Link></Pagination.Item>
                        {/if}
                    {/each}
                    <Pagination.Item><Pagination.NextButton><ChevronsRight class="size-4" /></Pagination.NextButton></Pagination.Item>
                </Pagination.Content>
            {/snippet}
        </Pagination.Root>
    </div>
{/if}
