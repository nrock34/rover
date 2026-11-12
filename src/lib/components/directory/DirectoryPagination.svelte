<script>
    import * as Pagination from "$lib/components/ui/pagination";

    let { pageInfo, loading = false, onPageChange } = $props();
</script>

{#if pageInfo.pageCount > 1}
    <div class="mt-6 flex flex-col items-center gap-2 border-t border-border pt-5">
        <p class="text-xs text-muted-foreground">Page {pageInfo.page} of {pageInfo.pageCount}</p>
        <Pagination.Root
            count={pageInfo.total}
            perPage={pageInfo.pageSize}
            bind:page={() => pageInfo.page, onPageChange}
            siblingCount={1}
            aria-label="Results pages"
        >
            {#snippet children({ pages })}
                <Pagination.Content class="flex-wrap">
                    <Pagination.Item><Pagination.PrevButton disabled={loading || pageInfo.page <= 1} /></Pagination.Item>
                    {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                            <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
                        {:else}
                            <Pagination.Item><Pagination.Link {page} disabled={loading} isActive={pageInfo.page === page.value}>{page.value}</Pagination.Link></Pagination.Item>
                        {/if}
                    {/each}
                    <Pagination.Item><Pagination.NextButton disabled={loading || pageInfo.page >= pageInfo.pageCount} /></Pagination.Item>
                </Pagination.Content>
            {/snippet}
        </Pagination.Root>
    </div>
{/if}
