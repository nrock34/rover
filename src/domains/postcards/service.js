import { getApiUrl } from "../../core/env/server.js";
import { asHttpFailure, createHttpFailureMapper } from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import { requestGraphql } from "../../core/graphql/client.js";
import { assertPostcardDetailPayload, assertPostcardListPage } from "./contracts.js";
import { buildPostcardDetailQuery, buildPostcardDirectoryQuery } from "./graphql.js";
import {
	adaptPostcardDetailEnvelope,
	adaptPostcardDirectoryEnvelope,
	mapPostcardCard,
	mapPostcardDetail
} from "./mappers.js";

export const POSTCARDS_PAGE_SIZE = 12;
const SORT_OPTIONS = new Set(["", "-updated_at", "-like_count", "-views", "-comment_count"]);
/** @type {Record<string, string[]>} */
const GRAPHQL_SORTS = {
	"": ["date_published:desc", "createdAt:desc"],
	"-updated_at": ["updatedAt:desc"],
	"-like_count": ["like_count:desc"],
	"-views": ["views:desc"],
	"-comment_count": ["comment_count:desc"]
};

const postcardHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to load postcards.",
	network: { code: "network_error", message: "Postcards are temporarily unavailable." },
	invalidResponse: { code: "invalid_response", message: "The postcards service returned an invalid response." },
	statusMap: { 404: { code: "not_found", message: "Postcard not found." } }
});

/**
 * @param {unknown} details
 * @returns {string | null}
 */
function graphQLErrorMessage(details) {
	if (!details || typeof details !== "object" || Array.isArray(details)) return null;
	const errors = /** @type {Record<string, unknown>} */ (details).errors;
	if (!Array.isArray(errors)) return null;
	const message = errors.find((item) =>
		item && typeof item === "object" && !Array.isArray(item) && typeof item.message === "string"
	)?.message;
	return typeof message === "string" && message.trim()
		? message.replace(/\s+/gu, " ").trim().slice(0, 240)
		: null;
}

/**
 * @param {import("../../core/http/client.js").HttpFailure} failure
 * @param {string} fallbackMessage
 * @returns {import("./types.js").PostcardDomainError}
 */
function mapHttpFailure(failure, fallbackMessage) {
	const mapped = postcardHttpFailureMapper(failure, { fallbackMessage });
	const graphqlMessage = graphQLErrorMessage(failure.error.details);
	return /** @type {import("./types.js").PostcardDomainError} */ (
		graphqlMessage
			? { ...mapped, message: `${mapped.message} CMS error: ${graphqlMessage}` }
			: mapped
	);
}

/**
 * @param {unknown} value
 * @returns {import("./types.js").PostcardDomainError}
 */
function asPostcardDomainError(value) {
	return /** @type {import("./types.js").PostcardDomainError} */ (coerceDomainError(value, {
		missingEnvCode: "missing_env",
		fallbackCode: "upstream_error",
		fallbackMessage: "Unexpected postcards domain failure."
	}));
}

/**
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
function filterText(value, maxLength) {
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/**
 * @param {Record<string, unknown>} params
 * @returns {import("./types.js").PostcardDirectoryFilters}
 */
export function normalizePostcardDirectoryFilters(params = {}) {
	const requestedPage = Number(params.page);
	const sortBy = filterText(params.sort_by ?? params.sortBy, 32);
	return {
		q: filterText(params.q ?? params.search, 120),
		category: filterText(params.category, 48),
		tag: filterText(params.tag, 48),
		sortBy: SORT_OPTIONS.has(sortBy) ? sortBy : "",
		page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10_000) : 1
	};
}

/** @returns {Record<string, unknown>} */
function publishedArticleFilters() {
	return {
		published: { eq: true },
		publication_status: { eq: "published" }
	};
}

/**
 * @param {import("./types.js").PostcardDirectoryFilters} filters
 * @returns {Record<string, unknown>}
 */
function directoryGraphqlFilters(filters) {
	const graphqlFilters = publishedArticleFilters();
	if (filters.q) {
		graphqlFilters.or = [
			{ title: { containsi: filters.q } },
			{ description: { containsi: filters.q } },
			{ excerpt: { containsi: filters.q } }
		];
	}
	if (filters.category) graphqlFilters.category = { name: { eqi: filters.category } };
	if (filters.tag) graphqlFilters.tags = { name: { eqi: filters.tag } };
	return graphqlFilters;
}

/**
 * @param {import("./types.js").PostcardDirectoryFilters} filters
 * @param {typeof fetch} fetchFn
 */
async function requestPostcardPage(filters, fetchFn) {
	const request = buildPostcardDirectoryQuery({
		filters: directoryGraphqlFilters(filters),
		pagination: { page: filters.page, pageSize: POSTCARDS_PAGE_SIZE },
		sort: GRAPHQL_SORTS[filters.sortBy],
		status: "PUBLISHED",
		taxonomyPagination: { page: 1, pageSize: 100 }
	});
	return requestGraphql({
		fetchFn,
		query: request.query,
		operationName: "PostcardDirectory",
		variables: request.variables
	});
}

/**
 * @param {Record<string, unknown>} params
 * @param {import("./types.js").PostcardFetchDeps} deps
 * @returns {Promise<import("./types.js").PostcardResult<import("./types.js").PostcardDirectoryPage>>}
 */
export async function loadPostcardDirectoryPage(params, { fetch }) {
	try {
		const apiUrl = getApiUrl();
		const filters = normalizePostcardDirectoryFilters(params);
		const response = await requestPostcardPage(filters, fetch);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load postcards.") };
		}

		const envelope = adaptPostcardDirectoryEnvelope(response.data);
		const legacyPage = assertPostcardListPage({
			count: envelope.pageInfo.total,
			next: envelope.pageInfo.page < envelope.pageInfo.pageCount ? `?page=${envelope.pageInfo.page + 1}` : null,
			previous: envelope.pageInfo.page > 1 ? `?page=${envelope.pageInfo.page - 1}` : null,
			results: envelope.nodes
		});
		const results = legacyPage.results.map((postcard) => mapPostcardCard(postcard, { apiUrl }));

		return {
			ok: true,
			data: {
				count: legacyPage.count,
				page: envelope.pageInfo.page,
				pageSize: POSTCARDS_PAGE_SIZE,
				totalPages: Math.max(1, envelope.pageInfo.pageCount),
				nextPage: envelope.pageInfo.page < envelope.pageInfo.pageCount ? envelope.pageInfo.page + 1 : null,
				previousPage: envelope.pageInfo.page > 1 ? envelope.pageInfo.page - 1 : null,
				results,
				filters,
				availableCategories: [...new Set(envelope.categories)].sort((a, b) => a.localeCompare(b)),
				availableTags: [...new Set(envelope.tags)].sort((a, b) => a.localeCompare(b))
			},
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asPostcardDomainError(error) };
	}
}

/**
 * @param {string} postcardId
 * @param {import("./types.js").PostcardFetchDeps} deps
 * @returns {Promise<import("./types.js").PostcardResult<import("./types.js").PostcardDetail>>}
 */
export async function loadPostcardDetail(postcardId, { fetch }) {
	try {
		const apiUrl = getApiUrl();
		const request = buildPostcardDetailQuery({
			filters: { ...publishedArticleFilters(), documentId: { eq: String(postcardId) } },
			pagination: { page: 1, pageSize: 1 },
			status: "PUBLISHED"
		});
		const response = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "PostcardDetail",
			variables: request.variables
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load this postcard.") };
		}
		const postcard = adaptPostcardDetailEnvelope(response.data);
		if (!postcard) {
			return {
				ok: false,
				error: /** @type {import("./types.js").PostcardDomainError} */ (
					createDomainError("not_found", 404, "Postcard not found.")
				)
			};
		}
		return {
			ok: true,
			data: mapPostcardDetail(assertPostcardDetailPayload(postcard), { apiUrl }),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asPostcardDomainError(error) };
	}
}

/**
 * @param {string} postcardId
 * @param {import("./types.js").PostcardFetchDeps} deps
 * @returns {Promise<import("./types.js").PostcardResult<import("./types.js").PostcardDetailPage>>}
 */
export async function loadPostcardDetailPage(postcardId, { fetch }) {
	const detailResult = await loadPostcardDetail(postcardId, { fetch });
	if (!detailResult.ok) return detailResult;

	try {
		const apiUrl = getApiUrl();
		const postcard = detailResult.data;
		const filters = /** @type {Record<string, unknown>} */ ({
			...publishedArticleFilters(),
			documentId: { ne: postcard.id }
		});
		if (postcard.category?.name) filters.category = { name: { eqi: postcard.category.name } };
		else if (postcard.tags[0]?.name) filters.tags = { name: { eqi: postcard.tags[0].name } };
		const request = buildPostcardDetailQuery({
			filters,
			pagination: { page: 1, pageSize: 3 },
			status: "PUBLISHED"
		});
		const relatedResponse = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "PostcardDetail",
			variables: request.variables
		});
		const relatedEnvelope = relatedResponse.ok
			? adaptPostcardDirectoryEnvelope({ articles: /** @type {Record<string, unknown>} */ (relatedResponse.data).articles })
			: null;
		const relatedPostcards = relatedEnvelope
			? relatedEnvelope.nodes
				.map((item) => mapPostcardCard(item, { apiUrl }))
				.filter((item) => item.id !== postcard.id)
				.slice(0, 3)
			: [];

		return {
			ok: true,
			data: { postcard, relatedPostcards },
			status: detailResult.status,
			headers: detailResult.headers
		};
	} catch {
		return {
			ok: true,
			data: { postcard: detailResult.data, relatedPostcards: [] },
			status: detailResult.status,
			headers: detailResult.headers
		};
	}
}
