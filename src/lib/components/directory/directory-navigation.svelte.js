import { goto } from "$app/navigation";
import { onDestroy } from "svelte";

import { directoryHref } from "./directory-url.js";

export function createDirectoryNavigation(getUrl) {
    let searchQuery = $state(getUrl().searchParams.get("q") ?? "");
    let error = $state("");
    let searchTimer;

    $effect(() => { searchQuery = getUrl().searchParams.get("q") ?? ""; });
    onDestroy(() => clearTimeout(searchTimer));

    async function navigate(changes, { resetPage = true, replaceState = false, focusResults = false } = {}) {
        clearTimeout(searchTimer);
        error = "";
        const url = getUrl();
        const href = directoryHref(url, changes, resetPage);
        if (href === `${url.pathname}${url.search}`) return;
        try {
            await goto(href, { keepFocus: true, noScroll: true, replaceState });
            if (focusResults) {
                const heading = document.getElementById("directory-results-heading");
                heading?.focus({ preventScroll: true });
                heading?.scrollIntoView({ block: "start", behavior: "instant" });
            }
        } catch {
            error = "Results could not be updated. Please try again.";
        }
    }

    return {
        get searchQuery() { return searchQuery; },
        get error() { return error; },
        search(value) {
            searchQuery = value;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => void navigate({ q: value.trim() }, { replaceState: true }), 300);
        },
        filter(key, value) { void navigate({ q: searchQuery.trim(), [key]: value }); },
        reset() {
            searchQuery = "";
            void navigate(Object.fromEntries([...getUrl().searchParams.keys()].map(key => [key, null])));
        },
        page(value) { void navigate({ page: value }, { resetPage: false, focusResults: true }); }
    };
}
