import { asHttpFailure, createHttpFailureMapper } from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import { requestGraphql } from "../../core/graphql/client.js";
import { parsePageNumber } from "../../core/graphql/pagination.js";
import { buildScholarshipOptions } from "./filter-options.js";
import { assertScholarshipDetailPayload, assertScholarshipListPayload } from "./contracts.js";
import { buildScholarshipsQuery } from "./graphql.js";
import {
	adaptScholarshipsConnection,
	mapScholarshipCard,
	mapScholarshipDetail
} from "./mappers.js";

const SCHOLARSHIP_PAGE_SIZE = 8;
const SCHOLARSHIP_BATCH_SIZE = 100;
/** @type {Record<string, string[]>} */
const SCHOLARSHIP_SORTS = {
	featured: ["featured:desc", "rating:desc", "name:asc"],
	deadline: ["deadline:asc", "name:asc"],
	amount: ["upper_bound:desc", "lower_bound:desc", "name:asc"],
	title: ["name:asc"]
};

const scholarshipHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to load scholarships.",
	network: {
		code: "network_error",
		message: "Scholarships upstream is unreachable."
	},
	invalidResponse: {
		code: "invalid_response",
		message: "Scholarships upstream returned invalid JSON."
	},
	statusMap: {
		404: {
			code: "not_found",
			message: "Scholarship not found."
		}
	}
});

const mapHttpFailure = /** @type {(failure: import("../../core/http/client.js").HttpFailure, fallbackMessage: string) => import("./types.js").ScholarshipDomainError} */ (
	(failure, fallbackMessage) =>
		/** @type {import("./types.js").ScholarshipDomainError} */ (
			scholarshipHttpFailureMapper(failure, { fallbackMessage })
		)
);

/** @param {unknown} value @returns {import("./types.js").ScholarshipDomainError} */
function asDomainError(value) {
	return /** @type {import("./types.js").ScholarshipDomainError} */ (
		coerceDomainError(value, {
			missingEnvCode: "missing_env",
			fallbackCode: "upstream_error",
			fallbackMessage: "Unexpected scholarship domain failure."
		})
	);
}

/** @param {unknown} value @param {number} max @returns {string} */
function filterText(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * @param {Record<string, string | number | null | undefined>} params
 * @returns {Record<string, unknown>}
 */
function scholarshipFilters(params) {
	const filters = /** @type {Record<string, unknown>} */ ({});
	const q = filterText(params.q, 120);
	const category = filterText(params.category, 80);
	const provider = filterText(params.provider, 284);
	const country = filterText(params.country, 125);
	const level = filterText(params.level, 40);
	const field = filterText(params.field, 64);
	const amount = filterText(params.amount, 32);
	const deadline = filterText(params.deadline, 24);
	const status = filterText(params.status, 32);
	if (q) {
		filters.or = [
			{ name: { containsi: q } },
			{ summary: { containsi: q } },
			{ description: { containsi: q } },
			{ provider: { name: { containsi: q } } },
			{ requirements: { eligibility: { containsi: q } } },
			{ requirements: { study_country: { containsi: q } } },
			{ requirements: { field: { containsi: q } } }
		];
	}
	if (category && category !== "all") filters.categories = { containsi: category };
	if (provider && provider !== "all") filters.provider = { name: { eqi: provider } };
	const requirements = /** @type {Record<string, unknown>} */ ({});
	if (country && country !== "all") {
		requirements.study_country = country === "worldwide"
			? { or: [{ eqi: "worldwide" }, { null: true }, { eq: "" }] }
			: { eqi: country };
	}
	if (level && level !== "all") requirements.grad_year = { eqi: level };
	if (field && field !== "all") requirements.field = { eqi: field };
	if (Object.keys(requirements).length) filters.requirements = requirements;
	const ranges = /** @type {Record<string, Record<string, number>>} */ ({
		"under-5000": { lt: 5000 }, "5000-15000": { gte: 5000, lte: 15000 }, "over-15000": { gt: 15000 }
	});
	if (ranges[amount]) {
		filters.and = [{ or: [
			{ upper_bound: { ne: 0, ...ranges[amount] } },
			{ and: [
				{ or: [{ upper_bound: { null: true } }, { upper_bound: { eq: 0 } }] },
				{ lower_bound: ranges[amount] }
			] }
		] }];
	}
	if (deadline === "open-ended") filters.deadline = { null: true };
	if (deadline === "30-days" || deadline === "90-days") {
		const today = new Date();
		const end = new Date(today);
		end.setUTCDate(end.getUTCDate() + (deadline === "30-days" ? 30 : 90));
		filters.deadline = { gte: today.toISOString().slice(0, 10), lte: end.toISOString().slice(0, 10) };
	}
	if (status) filters.status = { eq: status };
	if (String(params.featured).toLowerCase() === "true") filters.featured = { eq: true };
	return filters;
}

/**
 * @param {typeof fetch} fetchFn
 * @param {Record<string, unknown>} filters
 * @param {number} page
 * @param {number} pageSize
 * @param {string | null} accessToken
 * @param {string[]} [sort]
 * @param {boolean} [filterOptions]
 */
async function requestScholarshipPage(fetchFn, filters, page, pageSize, accessToken = null, sort = SCHOLARSHIP_SORTS.featured ?? [], filterOptions = false) {
	const request = buildScholarshipsQuery({
		filters,
		pagination: { page, pageSize: Math.min(pageSize, SCHOLARSHIP_BATCH_SIZE) },
		sort,
		status: "PUBLISHED"
	}, filterOptions);
	const params = {
		fetchFn,
		query: request.query,
		operationName: "Scholarships",
		variables: request.variables,
		...(accessToken ? { accessToken } : {})
	};
	const response = await requestGraphql(params);
	if (response.ok || !accessToken) return response;
	return requestGraphql({
		...params,
		accessToken: undefined
	});
}

/**
 * @param {import("./types.js").ScholarshipFetchDeps} deps
 * @param {Record<string, string | number | null | undefined>} [params]
 * @returns {Promise<import("./types.js").ScholarshipServiceResult<import("./types.js").ScholarshipDirectoryPage>>}
 */
export async function loadScholarshipDirectory({ fetch }, params = {}) {
	try {
		const page = parsePageNumber(params.page);
		if (page == null) return { ok: false, error: /** @type {import("./types.js").ScholarshipDomainError} */ (createDomainError("invalid_response", 400, "Invalid scholarship page.")) };
		const filters = scholarshipFilters(params);
		const sort = SCHOLARSHIP_SORTS[filterText(params.sort_by, 24)] ?? SCHOLARSHIP_SORTS.featured ?? [];
		let response = await requestScholarshipPage(fetch, filters, page, SCHOLARSHIP_PAGE_SIZE, null, sort);
		if (!response.ok) return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load scholarships.") };
		let connection = adaptScholarshipsConnection(response.data);
		if (page > Math.max(1, connection.pageInfo.pageCount)) {
			response = await requestScholarshipPage(fetch, filters, Math.max(1, connection.pageInfo.pageCount), SCHOLARSHIP_PAGE_SIZE, null, sort);
			if (!response.ok) return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load scholarships.") };
			connection = adaptScholarshipsConnection(response.data);
		}
		const payload = assertScholarshipListPayload(connection.nodes);
		return {
			ok: true,
			data: { results: payload.items.map(mapScholarshipCard), pageInfo: connection.pageInfo },
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asDomainError(error) };
	}
}

/**
 * Load only filter metadata independently of the current results page.
 * @param {import("./types.js").ScholarshipFetchDeps} deps
 * @returns {Promise<import("./types.js").ScholarshipServiceResult<import("./filter-options.js").ScholarshipFilterOptions>>}
 */
export async function loadScholarshipFilterOptions({ fetch }) {
	try {
		const items = [];
		let page = 1;
		let pageCount = 1;
		let status = 200;
		let headers = new Headers();
		while (page <= pageCount) {
			const response = await requestScholarshipPage(
				fetch,
				{},
				page,
				SCHOLARSHIP_BATCH_SIZE,
				null,
				["name:asc"],
				true
			);
			if (!response.ok) {
				return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load scholarships.") };
			}
			const connection = adaptScholarshipsConnection(response.data);
			items.push(...connection.nodes.map(mapScholarshipCard));
			pageCount = connection.pageInfo.pageCount;
			status = response.status;
			headers = response.headers;
			page += 1;
		}
		return { ok: true, data: buildScholarshipOptions(items), status, headers };
	} catch (error) {
		return { ok: false, error: asDomainError(error) };
	}
}

/**
 * @param {string} scholarshipId
 * @param {import("./types.js").ScholarshipFetchDeps & { accessToken?: string | null }} deps
 * @returns {Promise<import("./types.js").ScholarshipServiceResult<import("./types.js").ScholarshipDetail>>}
 */
export async function loadScholarshipDetail(scholarshipId, { fetch, accessToken = null }) {
	try {
		const response = await requestScholarshipPage(fetch, {
			documentId: { eq: String(scholarshipId) }
		}, 1, 1, accessToken);
		if (!response.ok) {
			return {
				ok: false,
				error: mapHttpFailure(asHttpFailure(response), "Failed to load scholarship details.")
			};
		}
		const scholarship = adaptScholarshipsConnection(response.data).nodes[0];
		if (!scholarship) {
			return {
				ok: false,
				error: /** @type {import("./types.js").ScholarshipDomainError} */ (
					createDomainError("not_found", 404, "Scholarship not found.")
				)
			};
		}
		return {
			ok: true,
			data: mapScholarshipDetail(assertScholarshipDetailPayload(scholarship)),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asDomainError(error) };
	}
}

/**
 * @param {string} scholarshipId
 * @param {import("./types.js").ScholarshipFetchDeps & { accessToken?: string | null }} deps
 * @returns {Promise<import("./types.js").ScholarshipServiceResult<{ scholarship: import("./types.js").ScholarshipDetail, similarScholarships: import("./types.js").ScholarshipCard[] }>>}
 */
export async function loadScholarshipDetailPage(scholarshipId, { fetch, accessToken = null }) {
	const detailResult = await loadScholarshipDetail(String(scholarshipId), { fetch, accessToken });
	if (!detailResult.ok) return detailResult;

	const primaryCategory = detailResult.data.categories[0] ?? null;
	const listResult = await loadScholarshipDirectory({ fetch }, primaryCategory ? { category: primaryCategory } : {});
	return {
		ok: true,
		data: {
			scholarship: detailResult.data,
			similarScholarships: listResult.ok
				? listResult.data.results.filter((item) => item.id !== detailResult.data.id).slice(0, 3)
				: []
		},
		status: detailResult.status,
		headers: detailResult.headers
	};
}
