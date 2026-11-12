import { asHttpFailure, createHttpFailureMapper } from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import { decodePageCursor, encodePageCursor, parsePageNumber } from "../../core/graphql/pagination.js";
import { requestGraphql } from "../../core/graphql/client.js";
import { assertProgramCountriesPayload, assertProgramDetailPayload, assertProgramListPage } from "./contracts.js";
import { buildProgramsQuery } from "./graphql.js";
import {
	adaptProgramsConnection,
	getProgramDetailMissingFields,
	mapProgramCard,
	mapProgramCountryOption,
	mapProgramDetail
} from "./mappers.js";

const PROGRAM_PAGE_SIZE = 12;
const PROGRAM_BATCH_SIZE = 100;
const PROGRAM_DEFAULT_SORT = ["featured:desc", "rating:desc", "createdAt:desc"];
/** @type {Record<string, string[]>} */
const PROGRAM_SORTS = {
	rating: PROGRAM_DEFAULT_SORT,
	cost: ["cost.total_fee:asc", "title:asc"],
	participants: ["participants:desc", "title:asc"],
	alphabetical: ["title:asc"]
};

const programHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to load program data.",
	network: {
		code: "network_error",
		message: "Programs upstream is unreachable."
	},
	invalidResponse: {
		code: "invalid_response",
		message: "Programs upstream returned invalid JSON."
	},
	statusMap: {
		404: {
			code: "not_found",
			message: "Program not found."
		}
	}
});

const mapHttpFailure = /** @type {(failure: import("../../core/http/client.js").HttpFailure, fallbackMessage: string) => import("./types.js").ProgramDomainError} */ (
	(failure, fallbackMessage) =>
		/** @type {import("./types.js").ProgramDomainError} */ (
			programHttpFailureMapper(failure, { fallbackMessage })
		)
);

/** @param {unknown} value @returns {import("./types.js").ProgramDomainError} */
function asProgramDomainError(value) {
	return /** @type {import("./types.js").ProgramDomainError} */ (
		coerceDomainError(value, {
			missingEnvCode: "missing_env",
			fallbackCode: "upstream_error",
			fallbackMessage: "Unexpected programs domain failure."
		})
	);
}

/**
 * @param {import("./types.js").ProgramErrorCode} code
 * @param {string} message
 * @param {Partial<import("./types.js").ProgramDomainError>} [extra]
 * @returns {import("./types.js").ProgramDomainError}
 */
function makeError(code, message, extra = {}) {
	return createDomainError(code, extra.status ?? 500, message, extra.details);
}

/** @param {unknown} value @param {number} max @returns {string} */
function filterText(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** @returns {Record<string, unknown>} */
function publishedProgramFilters() {
	return { publication_status: { eq: "published" } };
}

/**
 * @param {Record<string, string | number | null | undefined>} params
 * @returns {{ filters: Record<string, unknown>; page: number; sort: string[] } | { error: import("./types.js").ProgramDomainError }}
 */
function normalizeProgramRequest(params) {
	const cursor = filterText(params.cursor, 256);
	const decodedPage = params.page != null ? parsePageNumber(params.page) : cursor ? decodePageCursor(cursor) : 1;
	if (decodedPage == null) {
		return { error: makeError("invalid_response", "Invalid program page.", { status: 400 }) };
	}
	const q = filterText(params.q, 120);
	const country = filterText(params.country, 80);
	const provider = filterText(params.provider, 284);
	const duration = filterText(params.duration, 24);
	const durationGroup = filterText(params.duration_group, 24);
	const subject = filterText(params.subject, 120);
	const language = filterText(params.language, 30);
	const listing = filterText(params.listing, 24);
	const sortKey = filterText(params.sort_by, 32);
	const filters = publishedProgramFilters();
	if (q) {
		filters.or = [
			{ title: { containsi: q } },
			{ shortDescription: { containsi: q } },
			{ description: { containsi: q } },
			{ provider: { name: { containsi: q } } }
		];
	}
	const providerFilters = /** @type {Record<string, unknown>} */ ({});
	if (provider && provider !== "all") providerFilters.name = { eqi: provider };
	if (country && country !== "all") {
		providerFilters.university = {
			or: [
				{ country: { eqi: country } },
				{ location: { country_name: { eqi: country } } }
			]
		};
	}
	if (Object.keys(providerFilters).length) filters.provider = providerFilters;
	const durationFilters = /** @type {Record<string, unknown>} */ ({});
	if (duration && duration !== "all") durationFilters.eq = duration;
	const durationGroups = /** @type {Record<string, string[]>} */ ({
		short: ["brk", "twowks", "sxwks"], semester: ["sem"], summer: ["sum"], year: ["yr"]
	});
	if (durationGroups[durationGroup]) durationFilters.in = durationGroups[durationGroup];
	if (Object.keys(durationFilters).length) filters.duration = durationFilters;
	if (subject && subject !== "all") filters.fields = { name: { eqi: subject } };
	if (language && language !== "all") filters.language = { eqi: language };
	if (listing === "featured" || listing === "standard") filters.featured = { eq: listing === "featured" };
	return {
		filters,
		page: decodedPage ?? 1,
		sort: PROGRAM_SORTS[sortKey] ?? PROGRAM_DEFAULT_SORT
	};
}

/**
 * @param {typeof fetch} fetchFn
 * @param {Record<string, unknown>} filters
 * @param {number} page
 * @param {number} pageSize
 * @param {string[]} sort
 * @param {boolean} [filterOptions]
 */
async function requestProgramPage(fetchFn, filters, page, pageSize, sort, filterOptions = false) {
	const request = buildProgramsQuery({
		filters,
		pagination: { page, pageSize: Math.min(pageSize, PROGRAM_BATCH_SIZE) },
		sort,
		status: "PUBLISHED"
	}, filterOptions);
	return requestGraphql({
		fetchFn,
		query: request.query,
		operationName: "Programs",
		variables: request.variables
	});
}

/**
 * @param {import("./types.js").ProgramFetchDeps} deps
 * @param {Record<string, string | number | null | undefined>} [params]
 * @returns {Promise<import("./types.js").ProgramResult<import("./types.js").ProgramDirectoryPage>>}
 */
export async function loadProgramDirectoryPage({ fetch }, params = {}) {
	try {
		const normalized = normalizeProgramRequest(params);
		if ("error" in normalized) return { ok: false, error: normalized.error };
		let response = await requestProgramPage(fetch, normalized.filters, normalized.page, PROGRAM_PAGE_SIZE, normalized.sort);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load programs.") };
		}
		let connection = adaptProgramsConnection(response.data);
		if (normalized.page > Math.max(1, connection.pageInfo.pageCount)) {
			response = await requestProgramPage(fetch, normalized.filters, Math.max(1, connection.pageInfo.pageCount), PROGRAM_PAGE_SIZE, normalized.sort);
			if (!response.ok) return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load programs.") };
			connection = adaptProgramsConnection(response.data);
		}
		const page = assertProgramListPage(connection.nodes);
		return {
			ok: true,
			data: {
				pageInfo: connection.pageInfo,
				next: connection.pageInfo.page < connection.pageInfo.pageCount
					? encodePageCursor(connection.pageInfo.page + 1)
					: null,
				prev: connection.pageInfo.page > 1 ? encodePageCursor(connection.pageInfo.page - 1) : null,
				results: page.results.map(mapProgramCard)
			},
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asProgramDomainError(error) };
	}
}

/**
 * @param {import("./types.js").ProgramFetchDeps} deps
 * @returns {Promise<import("./types.js").ProgramResult<import("./types.js").ProgramCountryOption[]>>}
 */
export async function loadProgramCountries({ fetch }) {
	const result = await loadProgramFilterOptions({ fetch });
	return result.ok ? { ...result, data: result.data.countries } : result;
}

/**
 * @param {import("./types.js").ProgramFetchDeps} deps
 * @returns {Promise<import("./types.js").ProgramResult<import("./types.js").ProgramFilterOptions>>}
 */
export async function loadProgramFilterOptions({ fetch }) {
	try {
		const counts = new Map();
		const providers = new Map();
		const subjects = new Set();
		const languages = new Set();
		let page = 1;
		let pageCount = 1;
		let status = 200;
		let headers = new Headers();
		while (page <= pageCount) {
			const response = await requestProgramPage(
				fetch,
				publishedProgramFilters(),
				page,
				PROGRAM_BATCH_SIZE,
				["title:asc"],
				true
			);
			if (!response.ok) {
				return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load program filter options.") };
			}
			const connection = adaptProgramsConnection(response.data);
			for (const program of connection.nodes) {
				const location = program.location;
				const locationRecord = location && typeof location === "object"
					? /** @type {Record<string, unknown>} */ (location)
					: null;
				const country = locationRecord && typeof locationRecord.country === "string"
					? locationRecord.country.trim()
					: "";
				if (country) counts.set(country, (counts.get(country) ?? 0) + 1);
				const provider = program.provider && typeof program.provider === "object"
					? /** @type {Record<string, unknown>} */ (program.provider)
					: null;
				const name = typeof provider?.name === "string" ? provider.name.trim() : "";
				const id = name.toLowerCase();
				if (id && id !== "all" && !providers.has(id)) providers.set(id, name);
				for (const field of Array.isArray(program.fields) ? program.fields : []) {
					if (field && typeof field.name === "string" && field.name.trim()) subjects.add(field.name.trim());
				}
				if (typeof program.language === "string" && program.language.trim()) languages.add(program.language.trim());
			}
			pageCount = connection.pageInfo.pageCount;
			status = response.status;
			headers = response.headers;
			page += 1;
		}
		const payload = [...counts.entries()]
			.map(([country, count]) => ({ country, count }))
			.sort((a, b) => a.country.localeCompare(b.country));
		return {
			ok: true,
			data: {
				countries: assertProgramCountriesPayload(payload).map(mapProgramCountryOption),
				providers: [...providers.entries()]
					.map(([id, name]) => ({ id, name }))
					.sort((a, b) => a.name.localeCompare(b.name)),
				subjects: [...subjects].sort().map(name => ({ id: name, name })),
				languages: [...languages].sort().map(name => ({ id: name, name }))
			},
			status,
			headers
		};
	} catch (error) {
		return { ok: false, error: asProgramDomainError(error) };
	}
}

/**
 * @param {string} programId
 * @param {import("./types.js").ProgramFetchDeps} deps
 * @returns {Promise<import("./types.js").ProgramResult<import("./types.js").ProgramDetail>>}
 */
export async function loadProgramDetail(programId, { fetch }) {
	try {
		const response = await requestProgramPage(fetch, {
			...publishedProgramFilters(),
			documentId: { eq: String(programId) }
		}, 1, 1, ["createdAt:desc"]);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load program details.") };
		}
		const rawProgram = adaptProgramsConnection(response.data).nodes[0];
		if (!rawProgram) {
			return { ok: false, error: makeError("not_found", "Program not found.", { status: 404 }) };
		}
		const validatedProgram = assertProgramDetailPayload(rawProgram);
		const university = validatedProgram.university && typeof validatedProgram.university === "object"
			? /** @type {Record<string, unknown>} */ (validatedProgram.university)
			: null;
		const program = mapProgramDetail(validatedProgram, university);
		const missingFields = getProgramDetailMissingFields(program);
		if (missingFields.length > 0) {
			return {
				ok: false,
				error: makeError("not_ready", "This program is not available yet.", {
					status: 404,
					details: { missingFields }
				})
			};
		}
		return { ok: true, data: program, status: response.status, headers: response.headers };
	} catch (error) {
		return { ok: false, error: asProgramDomainError(error) };
	}
}

/** @param {string} programId @param {import("./types.js").ProgramFetchDeps} deps */
export async function loadProgramDetailPage(programId, deps) {
	return loadProgramDetail(programId, deps);
}
