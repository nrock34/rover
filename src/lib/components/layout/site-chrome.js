const MARKETING_PATHS = new Set([
    "/",
    "/about",
    "/contact",
    "/landing-test",
    "/privacy-policy",
    "/terms-of-service"
]);

const NESTED_NAV_PATHS = new Set([
    "/community",
    "/postcards",
    "/programs",
    "/profile",
    "/profiles",
    "/resources",
    "/scholarships"
]);

/**
 * @param {string} pathname
 * @returns {string}
 */
export function normalizePathname(pathname) {
    if (typeof pathname !== "string" || pathname.length === 0) return "/";

    const normalized = pathname.replace(/\/+$/u, "");
    return normalized || "/";
}

/**
 * @param {string} pathname
 * @returns {{ header: "marketing" | "app" | null; footer: boolean; statusBanner: boolean }}
 */
export function getSiteChrome(pathname) {
    const currentPath = normalizePathname(pathname);
    const hidesChrome = currentPath === "/auth" ||
        currentPath.startsWith("/auth/") ||
        currentPath === "/onboarding" ||
        currentPath.startsWith("/onboarding/") ||
        currentPath === "/develop-preview/onboarding";

    if (hidesChrome) {
        return { header: null, footer: false, statusBanner: false };
    }

    if (currentPath === "/landing-test") {
        return { header: "marketing", footer: false, statusBanner: false };
    }

    if (MARKETING_PATHS.has(currentPath)) {
        return { header: "marketing", footer: true, statusBanner: true };
    }

    return { header: "app", footer: true, statusBanner: true };
}

/**
 * @param {string} pathname
 * @param {string} href
 * @returns {boolean}
 */
export function isRouteActive(pathname, href) {
    const currentPath = normalizePathname(pathname);
    const targetPath = normalizePathname(href);

    if (targetPath === "/") return currentPath === "/";
    if (currentPath === targetPath) return true;

    return NESTED_NAV_PATHS.has(targetPath) && currentPath.startsWith(`${targetPath}/`);
}
