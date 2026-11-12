import { getApiUrl } from "../../core/env/server.js";
import { asHttpFailure, createHttpFailureMapper } from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import { requestGraphql } from "../../core/graphql/client.js";
import { assertResourceDetail, assertResourceSummary } from "./contracts.js";
import { RESOURCE_ROOTS, buildResourceQuery } from "./graphql.js";
import {
	adaptResourceConnection,
	mapResourceCard,
	mapResourceDetail
} from "./mappers.js";

const RESOURCE_PAGE_SIZE = 100;

const resourceHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to load resources.",
	network: {
		code: "network_error",
		message: "Resources upstream is unreachable."
	},
	invalidResponse: {
		code: "invalid_response",
		message: "Resources upstream returned invalid JSON."
	},
	statusMap: {
		404: {
			code: "not_found",
			message: "Resource not found."
		}
	}
});

const mapHttpFailure = /** @type {(failure: import("../../core/http/client.js").HttpFailure, fallbackMessage: string) => import("./types.js").ResourceDomainError} */ (
	(failure, fallbackMessage) =>
		/** @type {import("./types.js").ResourceDomainError} */ (
			resourceHttpFailureMapper(failure, { fallbackMessage })
		)
);

/**
 * @param {unknown} value
 * @returns {import("./types.js").ResourceDomainError}
 */
function asResourceDomainError(value) {
	return /** @type {import("./types.js").ResourceDomainError} */ (
		coerceDomainError(value, {
			missingEnvCode: "missing_env",
			fallbackCode: "upstream_error",
			fallbackMessage: "Unexpected resource domain failure."
		})
	);
}

/** @returns {Record<string, unknown>} */
function publishedResourceFilters() {
	return { publication_status: { eq: "published" } };
}

/**
 * @param {(typeof RESOURCE_ROOTS)[number]} root
 * @param {Record<string, unknown>} filters
 * @param {number} page
 * @param {number} pageSize
 * @param {typeof fetch} fetchFn
 */
async function requestResourcePage(root, filters, page, pageSize, fetchFn) {
	const request = buildResourceQuery(root, {
		filters,
		pagination: { page, pageSize: Math.min(pageSize, RESOURCE_PAGE_SIZE) },
		sort: ["createdAt:desc", "documentId:asc"],
		status: "PUBLISHED"
	});
	return requestGraphql({
		fetchFn,
		query: request.query,
		operationName: root.operationName,
		variables: request.variables
	});
}

/**
 * @param {(typeof RESOURCE_ROOTS)[number]} root
 * @param {import("./types.js").ResourceFetchDeps} deps
 * @returns {Promise<import("./types.js").ResourceResult<Record<string, unknown>[]>>}
 */
async function loadResourceRoot(root, { fetch }) {
	try {
		const items = [];
		let page = 1;
		let pageCount = 1;
		let status = 200;
		let headers = new Headers();
		while (page <= pageCount) {
			const response = await requestResourcePage(root, publishedResourceFilters(), page, RESOURCE_PAGE_SIZE, fetch);
			if (!response.ok) {
				return {
					ok: false,
					error: mapHttpFailure(asHttpFailure(response), `Failed to load ${root.key} resources.`)
				};
			}
			const connection = adaptResourceConnection(response.data, root);
			items.push(...connection.nodes.map(assertResourceSummary));
			pageCount = connection.pageInfo.pageCount;
			status = response.status;
			headers = response.headers;
			page += 1;
		}
		return { ok: true, data: items, status, headers };
	} catch (error) {
		return { ok: false, error: asResourceDomainError(error) };
	}
}

/**
 * @param {import("./types.js").ResourceFetchDeps} deps
 * @returns {Promise<import("./types.js").ResourceResult<import("./types.js").ResourceCollections>>}
 */
export async function loadResourceCollections(deps) {
	try {
		const apiUrl = getApiUrl();
		const rootResults = await Promise.all(RESOURCE_ROOTS.map((root) => loadResourceRoot(root, deps)));
		const failure = rootResults.find((result) => !result.ok);
		if (failure && !failure.ok) return failure;

		/** @type {import("./types.js").ResourceCollections} */
		const collections = {};
		for (const result of rootResults) {
			if (!result.ok) continue;
			for (const item of result.data) {
				const resource = mapResourceCard(item, { apiUrl });
				const bucket = collections[resource.category] ?? [];
				bucket.push(resource);
				collections[resource.category] = bucket;
			}
		}
		const firstSuccess = rootResults.find((result) => result.ok);
		return {
			ok: true,
			data: collections,
			status: firstSuccess?.status ?? 200,
			headers: firstSuccess?.headers ?? new Headers()
		};
	} catch (error) {
		return { ok: false, error: asResourceDomainError(error) };
	}
}

/**
 * @param {string} resourceId
 * @param {import("./types.js").ResourceFetchDeps} deps
 */
async function findResourceDetail(resourceId, { fetch }) {
	const results = await Promise.all(RESOURCE_ROOTS.map(async (root) => {
		const response = await requestResourcePage(root, {
			...publishedResourceFilters(),
			documentId: { eq: resourceId }
		}, 1, 1, fetch);
		if (!response.ok) return { root, response, resource: null };
		const resource = adaptResourceConnection(response.data, root).nodes[0] ?? null;
		return { root, response, resource };
	}));
	const match = results.find((result) => result.resource);
	if (match) return match;
	const failure = results.find((result) => !result.response.ok);
	const fallback = failure ?? results[0];
	if (!fallback) throw new Error("No resource roots are configured.");
	return fallback;
}

/**
 * @param {string} resourceId
 * @param {import("./types.js").ResourceFetchDeps} deps
 * @returns {Promise<import("./types.js").ResourceResult<import("./types.js").ResourceDetail>>}
 */
export async function loadResourceDetail(resourceId, { fetch }) {
	try {
		const apiUrl = getApiUrl();
		const match = await findResourceDetail(String(resourceId), { fetch });
		if (!match.response.ok) {
			return {
				ok: false,
				error: mapHttpFailure(asHttpFailure(match.response), "Failed to load resource details.")
			};
		}
		if (!match.resource) {
			return {
				ok: false,
				error: /** @type {import("./types.js").ResourceDomainError} */ (
					createDomainError("not_found", 404, "Resource not found.")
				)
			};
		}
		return {
			ok: true,
			data: mapResourceDetail(assertResourceDetail(match.resource), { apiUrl }),
			status: match.response.status,
			headers: match.response.headers
		};
	} catch (error) {
		return { ok: false, error: asResourceDomainError(error) };
	}
}

/**
 * @param {string} resourceId
 * @param {import("./types.js").ResourceFetchDeps} deps
 * @returns {Promise<import("./types.js").ResourceResult<import("./types.js").ResourceDetailPageData>>}
 */
export async function loadResourceDetailPage(resourceId, { fetch }) {
	try {
		const apiUrl = getApiUrl();
		const match = await findResourceDetail(String(resourceId), { fetch });
		if (!match.response.ok) {
			return {
				ok: false,
				error: mapHttpFailure(asHttpFailure(match.response), "Failed to load resource details.")
			};
		}
		if (!match.resource) {
			return {
				ok: false,
				error: /** @type {import("./types.js").ResourceDomainError} */ (
					createDomainError("not_found", 404, "Resource not found.")
				)
			};
		}
		const resource = mapResourceDetail(assertResourceDetail(match.resource), { apiUrl });
		const relatedFilters = /** @type {Record<string, unknown>} */ ({
			...publishedResourceFilters(),
			documentId: { ne: resource.id }
		});
		if (match.root.category == null) relatedFilters.category = { eq: resource.apiCategory };
		const relatedResponse = await requestResourcePage(match.root, relatedFilters, 1, 3, fetch);
		const relatedResources = relatedResponse.ok
			? adaptResourceConnection(relatedResponse.data, match.root).nodes
				.map(assertResourceSummary)
				.map((item) => mapResourceCard(item, { apiUrl }))
				.filter((item) => item.id !== resource.id)
				.slice(0, 3)
			: [];
		return {
			ok: true,
			data: { resource, relatedResources },
			status: match.response.status,
			headers: match.response.headers
		};
	} catch (error) {
		return { ok: false, error: asResourceDomainError(error) };
	}
}
