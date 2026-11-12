const CURSOR_PREFIX = "rwm:gql-page:v1:";

/** @param {unknown} value @returns {number | null} */
export function parsePageNumber(value) {
	if (value == null || value === "") return 1;
	if (!/^[1-9]\d*$/u.test(String(value))) return null;
	const page = Number(value);
	return Number.isSafeInteger(page) ? page : null;
}

/**
 * @param {string} value
 * @returns {string}
 */
function toBase64Url(value) {
	return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

/**
 * @param {string} value
 * @returns {string | null}
 */
function fromBase64Url(value) {
	if (!/^[A-Za-z0-9_-]+$/u.test(value)) return null;
	const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
	try {
		return atob(padded);
	} catch {
		return null;
	}
}

/**
 * @param {number} page
 * @returns {string}
 */
export function encodePageCursor(page) {
	if (!Number.isSafeInteger(page) || page <= 0) {
		throw new TypeError("GraphQL page cursor requires a positive safe integer");
	}
	return toBase64Url(`${CURSOR_PREFIX}${page}`);
}

/**
 * @param {string | null | undefined} cursor
 * @returns {number | null}
 */
export function decodePageCursor(cursor) {
	if (!cursor || typeof cursor !== "string") return null;
	const decoded = fromBase64Url(cursor);
	if (!decoded || !decoded.startsWith(CURSOR_PREFIX)) return null;
	const pageText = decoded.slice(CURSOR_PREFIX.length);
	if (!/^[1-9]\d*$/u.test(pageText)) return null;
	const page = Number(pageText);
	if (!Number.isSafeInteger(page) || page <= 0) return null;
	return encodePageCursor(page) === cursor ? page : null;
}
