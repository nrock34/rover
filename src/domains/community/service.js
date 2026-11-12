import { requestJson } from "../../core/http/client.js";
import { requestGraphql } from "../../core/graphql/client.js";
import { decodePageCursor, encodePageCursor } from "../../core/graphql/pagination.js";
import {
	asHttpFailure,
	buildApiUrl,
	createHttpFailureMapper,
	withBearerAuth
} from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import {
	assertCommentPage,
	assertCreateCommentResponse,
	assertCreatePostResponse,
	assertLikeToggleResponse,
	assertPost,
	assertPostPage,
	assertProgramList,
	assertScholarshipList,
	assertUpdateDetail,
	assertUpdatePage
} from "./contracts.js";
import {
	buildCommunityCommentsQuery,
	buildCommunityPostDetailQuery,
	buildCommunityPostsQuery,
	buildCommunityUpdatesQuery,
	buildPostByLegacyIdQuery
} from "./graphql.js";
import { buildProgramsQuery } from "../programs/graphql.js";
import { buildScholarshipsQuery } from "../scholarships/graphql.js";
import {
	adaptCommentsEnvelope,
	adaptCommunityConnection,
	adaptGraphqlPost,
	adaptGraphqlUpdate,
	adaptLegacyPostLookup,
	deriveUpcomingDeadlines,
	mapCommunityComment,
	mapCommunityPost,
	mapCommunityProgram,
	mapCommunityScholarship,
	mapCommunityUpdate,
	mapCommunityUpdateDetail
} from "./mappers.js";
import { adaptProgramsConnection } from "../programs/mappers.js";
import { adaptScholarshipsConnection } from "../scholarships/mappers.js";

const COMMUNITY_PAGE_SIZE = 20;

/** @param {import("./types.js").CommunityErrorCode} code @param {string} message @param {Partial<import("./types.js").CommunityDomainError>} [extra] */
function makeError(code, message, extra = {}) {
	return createDomainError(code, extra.status ?? 500, message, extra.details);
}

const communityHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to load community data.",
	network: { code: "network_error", message: "Community upstream is unreachable." },
	invalidResponse: { code: "invalid_response", message: "Community upstream returned invalid JSON." },
	statusMap: {
		401: { code: "unauthorized", message: "You need to be logged in to do that." },
		403: { code: "unauthorized", message: "You need to be logged in to do that." }
	}
});

const mapHttpFailure = /** @type {(failure: import("../../core/http/client.js").HttpFailure, fallbackMessage: string) => import("./types.js").CommunityDomainError} */ (
	(failure, fallbackMessage) =>
		/** @type {import("./types.js").CommunityDomainError} */ (
			communityHttpFailureMapper(failure, { fallbackMessage })
		)
);

/** @param {unknown} value @returns {import("./types.js").CommunityDomainError} */
function asCommunityDomainError(value) {
	return /** @type {import("./types.js").CommunityDomainError} */ (
		coerceDomainError(value, {
			missingEnvCode: "missing_env",
			fallbackCode: "upstream_error",
			fallbackMessage: "Unexpected community domain failure."
		})
	);
}

/**
 * REST boundary used only for writes.
 * @template TResult
 * @param {{
 *   fetch: typeof fetch;
 *   accessToken?: string | null;
 *   path: string;
 *   fallbackMessage: string;
 *   method: string;
 *   body?: unknown;
 *   expectJson?: boolean;
 *   requireAuthMessage: string;
 *   mapData: (value: unknown) => TResult;
 * }} options
 * @returns {Promise<import("./types.js").CommunityResult<TResult>>}
 */
async function requestCommunityMutation(options) {
	if (!options.accessToken) {
		return {
			ok: false,
			error: makeError("unauthorized", options.requireAuthMessage, { status: 401 })
		};
	}
	try {
		const response = await requestJson(buildApiUrl(options.path), {
			method: options.method,
			fetchFn: options.fetch,
			headers: withBearerAuth(options.accessToken),
			body: options.body,
			expectJson: options.expectJson
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), options.fallbackMessage) };
		}
		return {
			ok: true,
			data: options.mapData(response.data),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/**
 * Existing Django JWTs may not be accepted by Strapi. Forward once for
 * viewer-specific fields, then retry the same public content query anonymously.
 * @param {Parameters<typeof requestGraphql>[0]} params
 * @param {string | null} accessToken
 */
async function requestCommunityGraphql(params, accessToken = null) {
	const response = await requestGraphql({ ...params, ...(accessToken ? { accessToken } : {}) });
	if (response.ok || !accessToken) return response;
	return requestGraphql(params);
}

/** @returns {Record<string, unknown>} */
function publishedPostFilters() {
	return {
		published: { eq: true },
		publication_status: { eq: "published" }
	};
}

/** @param {string} now @returns {Record<string, unknown>} */
function activeUpdateFilters(now) {
	return {
		publication_status: { eq: "published" },
		is_active: { eq: true },
		or: [
			{ expires_at: { null: true } },
			{ expires_at: { gt: now } }
		]
	};
}

/** @param {unknown} cursor @returns {number | null} */
function requestedPage(cursor) {
	if (cursor == null || cursor === "") return 1;
	return typeof cursor === "string" ? decodePageCursor(cursor) : null;
}

/**
 * @template T
 * @param {T[]} results
 * @param {{ page: number; pageCount: number }} pageInfo
 * @returns {import("./types.js").CommunityCursorPage<T>}
 */
function toCursorPage(results, pageInfo) {
	return {
		results,
		nextCursor: pageInfo.page < pageInfo.pageCount ? encodePageCursor(pageInfo.page + 1) : null,
		previousCursor: pageInfo.page > 1 ? encodePageCursor(pageInfo.page - 1) : null,
		nextUrl: null,
		previousUrl: null
	};
}

/** @param {unknown} value @param {number} max @returns {string} */
function filterText(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** @param {Record<string, unknown>} params @returns {Record<string, unknown>} */
function postFilters(params) {
	const filters = publishedPostFilters();
	const q = filterText(params.q, 120);
	const category = filterText(params.category, 48);
	const type = filterText(params.type, 32);
	const tag = filterText(params.tag, 64);
	if (q) {
		filters.or = [
			{ title: { containsi: q } },
			{ content: { containsi: q } }
		];
	}
	if (category) filters.category = { name: { eqi: category } };
	if (type) filters.type = { eq: type };
	if (tag) filters.tags = { name: { eqi: tag } };
	return filters;
}

/** @param {unknown} sort @returns {string[]} */
function postSort(sort) {
	switch (filterText(sort, 32)) {
		case "popular": return ["like_count:desc", "comment_count:desc", "createdAt:desc"];
		case "oldest": return ["createdAt:asc"];
		default: return ["createdAt:desc"];
	}
}

/** @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunitySummaryData>>} */
export async function loadCommunitySummary({ fetch, accessToken = null }) {
	const [posts, updates, programs, scholarships] = await Promise.all([
		loadCommunitySummaryPosts({ fetch, accessToken }),
		loadCommunitySummaryUpdates({ fetch }),
		loadCommunityFeaturedPrograms({ fetch }),
		loadCommunityFeaturedScholarships({ fetch })
	]);
	const failure = [posts, updates, programs, scholarships].find((result) => !result.ok);
	if (failure && !failure.ok) return failure;
	const featuredPrograms = programs.ok ? programs.data : [];
	const featuredScholarships = scholarships.ok ? scholarships.data : [];
	return {
		ok: true,
		data: {
			posts: posts.ok ? posts.data : [],
			updates: updates.ok ? updates.data : [],
			featuredPrograms,
			featuredScholarships,
			upcomingDeadlines: deriveUpcomingDeadlines(featuredPrograms, featuredScholarships)
		},
		status: 200,
		headers: new Headers()
	};
}

/** @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityPostCard[]>>} */
export async function loadCommunitySummaryPosts({ fetch, accessToken = null }) {
	const result = await loadCommunityPostsPage({}, { fetch, accessToken });
	return result.ok
		? { ...result, data: result.data.results.slice(0, 6) }
		: result;
}

/** @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityUpdateCard[]>>} */
export async function loadCommunitySummaryUpdates({ fetch }) {
	const result = await loadCommunityUpdatesPage({}, { fetch });
	return result.ok
		? { ...result, data: result.data.results.slice(0, 6) }
		: result;
}

/** @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityProgramCard[]>>} */
export async function loadCommunityFeaturedPrograms({ fetch }) {
	try {
		const request = buildProgramsQuery({
			filters: { publication_status: { eq: "published" }, featured: { eq: true } },
			pagination: { page: 1, pageSize: 4 },
			sort: ["rating:desc", "createdAt:desc"],
			status: "PUBLISHED"
		});
		const response = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "Programs",
			variables: request.variables
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load featured programs.") };
		}
		return {
			ok: true,
			data: assertProgramList(adaptProgramsConnection(response.data).nodes).map(mapCommunityProgram),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/** @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityScholarshipCard[]>>} */
export async function loadCommunityFeaturedScholarships({ fetch }) {
	try {
		const request = buildScholarshipsQuery({
			filters: { featured: { eq: true } },
			pagination: { page: 1, pageSize: 4 },
			sort: ["rating:desc", "deadline:asc"],
			status: "PUBLISHED"
		});
		const response = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "Scholarships",
			variables: request.variables
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load featured scholarships.") };
		}
		return {
			ok: true,
			data: assertScholarshipList(adaptScholarshipsConnection(response.data).nodes).map(mapCommunityScholarship),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/**
 * @param {{ q?: string | null; category?: string | null; type?: string | null; tag?: string | null; sort_by?: string | null; cursor?: string | null }} params
 * @param {import("./types.js").CommunityFetchDeps} deps
 * @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityCursorPage<import("./types.js").CommunityPostCard>>>}
 */
export async function loadCommunityPostsPage(params, { fetch, accessToken = null }) {
	try {
		const page = requestedPage(params.cursor);
		if (page == null) return { ok: false, error: makeError("invalid_response", "Invalid post cursor.", { status: 400 }) };
		const tag = filterText(params.tag, 64);
		const request = buildCommunityPostsQuery({
			filters: postFilters(params),
			pagination: { page, pageSize: COMMUNITY_PAGE_SIZE },
			sort: postSort(params.sort_by),
			status: "PUBLISHED",
			tagFilters: tag ? { name: { eqi: tag } } : { documentId: { eq: "__none__" } }
		});
		const response = await requestCommunityGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "CommunityPosts",
			variables: request.variables
		}, accessToken);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load community posts.") };
		}
		const connection = adaptCommunityConnection(response.data, "posts", adaptGraphqlPost);
		if (tag && connection.matchingTagCount === 0) {
			return { ok: false, error: makeError("not_found", `The tag "${tag}" does not exist.`, { status: 404 }) };
		}
		const validated = assertPostPage(connection.nodes);
		return {
			ok: true,
			data: toCursorPage(validated.results.map(mapCommunityPost), connection.pageInfo),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/** @param {string} postId @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityPostDetail>>} */
export async function loadCommunityPostDetail(postId, { fetch, accessToken = null }) {
	try {
		const request = buildCommunityPostDetailQuery({
			filters: { ...publishedPostFilters(), documentId: { eq: String(postId) } },
			pagination: { page: 1, pageSize: 1 },
			status: "PUBLISHED"
		});
		const response = await requestCommunityGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "CommunityPostDetail",
			variables: request.variables
		}, accessToken);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load post details.") };
		}
		const post = adaptCommunityConnection(response.data, "posts", adaptGraphqlPost).nodes[0];
		if (!post) return { ok: false, error: makeError("not_found", "Post not found.", { status: 404 }) };
		return {
			ok: true,
			data: mapCommunityPost(assertPost(post)),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/** @param {import("./types.js").CreatePostPayload} payload @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<{ id: number; documentId: string | null }>>} */
export async function createCommunityPost(payload, { fetch, accessToken = null }) {
	const result = await requestCommunityMutation({
		fetch,
		accessToken,
		path: "posts/create",
		method: "POST",
		body: payload,
		fallbackMessage: "Failed to create the post.",
		requireAuthMessage: "You need to be logged in to create a post.",
		mapData: assertCreatePostResponse
	});
	if (!result.ok || result.data.documentId) return result;
	const lookupRequest = buildPostByLegacyIdQuery({ id: String(result.data.id) });
	const lookup = await requestGraphql({
		fetchFn: fetch,
		query: lookupRequest.query,
		operationName: "PostByLegacyId",
		variables: lookupRequest.variables
	});
	if (!lookup.ok) {
		return { ok: false, error: mapHttpFailure(asHttpFailure(lookup), "Failed to resolve the new post.") };
	}
	const documentId = adaptLegacyPostLookup(lookup.data);
	if (!documentId) {
		return { ok: false, error: makeError("invalid_response", "The new post identifier is unavailable.", { status: 502 }) };
	}
	return { ...result, data: { ...result.data, documentId } };
}

/** @param {number} postRestId @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<{ liked: boolean }>>} */
export async function toggleCommunityPostLike(postRestId, { fetch, accessToken = null }) {
	if (!Number.isSafeInteger(postRestId) || postRestId <= 0) {
		return { ok: false, error: makeError("invalid_response", "A numeric REST post id is required.", { status: 400 }) };
	}
	return requestCommunityMutation({
		fetch,
		accessToken,
		path: `posts/${postRestId}/like`,
		method: "POST",
		expectJson: true,
		fallbackMessage: "Failed to update post like status.",
		requireAuthMessage: "You need to be logged in to like a post.",
		mapData: assertLikeToggleResponse
	});
}

/**
 * @param {string} postId
 * @param {{ cursor?: string | null; sort_by?: string | null }} params
 * @param {import("./types.js").CommunityFetchDeps} deps
 * @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityCursorPage<import("./types.js").CommunityComment>>>}
 */
export async function loadCommunityPostComments(postId, params, { fetch, accessToken = null }) {
	try {
		const page = requestedPage(params.cursor);
		if (page == null) return { ok: false, error: makeError("invalid_response", "Invalid comment cursor.", { status: 400 }) };
		const sort = filterText(params.sort_by, 32) === "newest" ? "createdAt:desc" : "createdAt:asc";
		const request = buildCommunityCommentsQuery({
			filters: { ...publishedPostFilters(), documentId: { eq: String(postId) } },
			pagination: { page: 1, pageSize: 1 },
			status: "PUBLISHED",
			commentsPage: page,
			commentsPageSize: COMMUNITY_PAGE_SIZE,
			commentsSort: sort
		});
		const response = await requestCommunityGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "CommunityComments",
			variables: request.variables
		}, accessToken);
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load post comments.") };
		}
		const envelope = adaptCommentsEnvelope(response.data);
		const validated = assertCommentPage(envelope.comments);
		return {
			ok: true,
			data: toCursorPage(
				validated.results.map(mapCommunityComment),
				{ page, pageCount: Math.ceil(envelope.total / COMMUNITY_PAGE_SIZE) }
			),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/** @param {number} postRestId @param {import("./types.js").CreateCommentPayload} payload @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityComment>>} */
export async function createCommunityPostComment(postRestId, payload, { fetch, accessToken = null }) {
	if (!Number.isSafeInteger(postRestId) || postRestId <= 0) {
		return { ok: false, error: makeError("invalid_response", "A numeric REST post id is required.", { status: 400 }) };
	}
	return requestCommunityMutation({
		fetch,
		accessToken,
		path: `posts/${postRestId}/comments`,
		method: "POST",
		body: payload,
		fallbackMessage: "Failed to create the comment.",
		requireAuthMessage: "You need to be logged in to comment.",
		mapData: (value) => mapCommunityComment(assertCreateCommentResponse(value))
	});
}

/** @param {{ cursor?: string | null }} params @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityCursorPage<import("./types.js").CommunityUpdateCard>>>} */
export async function loadCommunityUpdatesPage(params, { fetch }) {
	try {
		const page = requestedPage(params.cursor);
		if (page == null) return { ok: false, error: makeError("invalid_response", "Invalid update cursor.", { status: 400 }) };
		const request = buildCommunityUpdatesQuery({
			filters: activeUpdateFilters(new Date().toISOString()),
			pagination: { page, pageSize: COMMUNITY_PAGE_SIZE },
			sort: ["urgent:desc", "updatedAt:desc"],
			status: "PUBLISHED"
		});
		const response = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "CommunityUpdates",
			variables: request.variables
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load community updates.") };
		}
		const connection = adaptCommunityConnection(response.data, "updates", adaptGraphqlUpdate);
		const validated = assertUpdatePage(connection.nodes);
		return {
			ok: true,
			data: toCursorPage(validated.results.map(mapCommunityUpdate), connection.pageInfo),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}

/** @param {string} updateId @param {import("./types.js").CommunityFetchDeps} deps @returns {Promise<import("./types.js").CommunityResult<import("./types.js").CommunityUpdateDetail>>} */
export async function loadCommunityUpdateDetail(updateId, { fetch }) {
	try {
		const request = buildCommunityUpdatesQuery({
			filters: {
				...activeUpdateFilters(new Date().toISOString()),
				documentId: { eq: String(updateId) }
			},
			pagination: { page: 1, pageSize: 1 },
			sort: ["updatedAt:desc"],
			status: "PUBLISHED"
		});
		const response = await requestGraphql({
			fetchFn: fetch,
			query: request.query,
			operationName: "CommunityUpdates",
			variables: request.variables
		});
		if (!response.ok) {
			return { ok: false, error: mapHttpFailure(asHttpFailure(response), "Failed to load update details.") };
		}
		const update = adaptCommunityConnection(response.data, "updates", adaptGraphqlUpdate).nodes[0];
		if (!update) return { ok: false, error: makeError("not_found", "Update not found.", { status: 404 }) };
		return {
			ok: true,
			data: mapCommunityUpdateDetail(assertUpdateDetail(update)),
			status: response.status,
			headers: response.headers
		};
	} catch (error) {
		return { ok: false, error: asCommunityDomainError(error) };
	}
}
