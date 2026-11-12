const ONBOARDED_ROUTE_ROOTS = ["/community", "/scholarships", "/profiles"];

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isOnboardedOnlyPath(pathname) {
	return ONBOARDED_ROUTE_ROOTS.some(
		(root) => pathname === root || pathname.startsWith(`${root}/`)
	);
}
