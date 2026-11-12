<script>
    let { label = "Directory planning resources", children } = $props();
</script>

<aside class="directory-support-rail" aria-label={label}>
    {@render children()}
</aside>

<style>
    .directory-support-rail {
        display: grid;
        gap: 1rem;
        align-items: stretch;
    }

    @media (min-width: 40rem) and (max-width: 79.999rem) {
        .directory-support-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .directory-support-rail :global(> :last-child:nth-child(odd)) {
            grid-column: 1 / -1;
        }
    }

    @media (min-width: 80rem) {
        .directory-support-rail {
            position: sticky;
            top: 5.5rem;
            grid-template-columns: minmax(0, 1fr);
        }
    }
</style>
