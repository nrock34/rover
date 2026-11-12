import { getStrapiGraphqlUrl } from "../env/server.js";
import { requestJson } from "../http/client.js";
import { createHttpClientError } from "../http/errors.js";

/**
 * @param {unknown} errors
 * @returns {Array<{ message: string; path?: Array<string | number>; code?: string }>}
 */
function sanitizeGraphqlErrors(errors) {
	if (!Array.isArray(errors)) return [];
	return errors.map((error) => {
		if (!error || typeof error !== "object") return { message: "GraphQL execution failed" };
		const record = /** @type {Record<string, unknown>} */ (error);
		const sanitized = /** @type {{ message: string; path?: Array<string | number>; code?: string }} */ ({
			message: typeof record.message === "string" ? record.message : "GraphQL execution failed"
		});
		if (Array.isArray(record.path) && record.path.every((part) => typeof part === "string" || typeof part === "number")) {
			sanitized.path = /** @type {Array<string | number>} */ (record.path);
		}
		const extensions = record.extensions;
		if (extensions && typeof extensions === "object") {
			const code = /** @type {Record<string, unknown>} */ (extensions).code;
			if (typeof code === "string") sanitized.code = code;
		}
		return sanitized;
	});
}

/** @param {string} document @returns {boolean} */
function isReadOnlyGraphqlDocument(document) {
	return /^\s*(?:query\b|\{)/u.test(document);
}

/**
 * @template T
 * @param {{
 *   fetchFn: typeof fetch;
 *   query: string;
 *   variables?: Record<string, unknown>;
 *   operationName: string;
 *   accessToken?: string;
 * }} params
 * @returns {Promise<import("../http/client.js").HttpResult<T>>}
 */
export async function requestGraphql({
	fetchFn,
	query,
	variables = {},
	operationName,
	accessToken
}) {
	if (!isReadOnlyGraphqlDocument(query)) {
		return {
			ok: false,
			status: 400,
			headers: new Headers(),
			error: createHttpClientError({
				code: "invalid_graphql_operation",
				status: 400,
				message: "GraphQL mutations are not supported. Use the REST API for writes.",
				details: { operationName }
			})
		};
	}

	const headers = new Headers();
	if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
	const result = await requestJson(getStrapiGraphqlUrl(), {
		fetchFn,
		method: "POST",
		headers,
		body: { query, variables, operationName }
	});
	if (!result.ok) return result;

	const envelope = result.data;
	if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
		return {
			ok: false,
			status: 502,
			headers: result.headers,
			error: createHttpClientError({
				code: "upstream_http_error",
				status: 502,
				message: `Invalid GraphQL response for ${operationName}`,
				details: { operationName, reason: "missing_data" }
			})
		};
	}

	const errors = /** @type {Record<string, unknown>} */ (envelope).errors;
	if (Array.isArray(errors) && errors.length > 0) {
		return {
			ok: false,
			status: 502,
			headers: result.headers,
			error: createHttpClientError({
				code: "upstream_http_error",
				status: 502,
				message: `GraphQL execution failed for ${operationName}`,
				details: { operationName, errors: sanitizeGraphqlErrors(errors) }
			})
		};
	}

	return {
		ok: true,
		status: result.status,
		headers: result.headers,
		data: /** @type {T} */ (/** @type {Record<string, unknown>} */ (envelope).data)
	};
}
