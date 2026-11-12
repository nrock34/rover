/** Build a directory URL while retaining the other active filters. */
export function directoryHref(url, changes, resetPage = true) {
    const params = new URLSearchParams(url.searchParams);
    params.delete("cursor");
    if (resetPage) params.delete("page");
    for (const [key, value] of Object.entries(changes)) {
        if (value == null || value === "" || value === "all" || (key === "page" && value === 1)) params.delete(key);
        else params.set(key, String(value));
    }
    const query = params.toString();
    return `${url.pathname}${query ? `?${query}` : ""}`;
}

