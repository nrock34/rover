/**
 * @typedef {{
 *   ok: boolean;
 *   level: "warning";
 *   title: string;
 *   message: string;
 *   code: string;
 * }} ContentServiceStatus
 */

const UNAVAILABLE_CODES = new Set(["network_error", "missing_env"]);

/**
 * @returns {ContentServiceStatus}
 */
export function contentServiceUnavailableStatus() {
	return {
		ok: false,
		level: "warning",
		title: "Content service unavailable",
		message: "Some live content cannot be reached right now. The site is still available with limited content.",
		code: "content_service_unavailable"
	};
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isContentServiceUnavailable(error) {
	if (!error || typeof error !== "object" || Array.isArray(error)) {
		return false;
	}

	const code = /** @type {{ code?: unknown }} */ (error).code;
	return typeof code === "string" && UNAVAILABLE_CODES.has(code);
}
