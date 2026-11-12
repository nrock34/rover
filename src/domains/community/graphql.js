import { query } from "gql-query-builder";

const POST_FIELDS = [
	"documentId",
	"restId",
	"type",
	{ category: ["documentId", "name"] },
	"title",
	{ author: ["documentId", "name", "avatar"] },
	"content",
	"media",
	"media_caption",
	"is_media_video",
	"published",
	"publication_status",
	"views",
	{ tags: ["documentId", "name"] },
	"like_count",
	"comment_count",
	"createdAt",
	"updatedAt",
	"publishedAt"
];

const UPDATE_FIELDS = [
	"documentId",
	"title",
	{ category: ["documentId", "name"] },
	{ image: ["documentId", "public_url", "alt_text", "caption"] },
	"urgent",
	"urgency",
	"color",
	"summary",
	"content",
	"comment_count",
	"like_count",
	"views",
	"shares",
	"expires_at",
	"is_active",
	"publication_status",
	"createdAt",
	"updatedAt",
	"publishedAt"
];

/** @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string; tagFilters: Record<string, unknown> }} variables */
export function buildCommunityPostsQuery(variables) {
	return query([
		{
			operation: { name: "posts_connection", alias: "posts" },
			variables: {
				filters: { value: variables.filters, type: "PostFiltersInput" },
				pagination: { value: variables.pagination, type: "PaginationArg", required: true },
				sort: { value: variables.sort, type: "String", list: true },
				status: { value: variables.status, type: "PublicationStatus", required: true }
			},
			fields: [{ nodes: POST_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
		},
		{
			operation: { name: "postTags_connection", alias: "matchingTags" },
			variables: {
				tagFilters: { value: variables.tagFilters, type: "PostTagFiltersInput", name: "filters" },
				tagPagination: { value: { page: 1, pageSize: 1 }, type: "PaginationArg", required: true, name: "pagination" },
				status: { value: variables.status, type: "PublicationStatus", required: true }
			},
			fields: [{ pageInfo: ["total"] }]
		}
	], null, { operationName: "CommunityPosts" });
}

/** @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; status: string }} variables */
export function buildCommunityPostDetailQuery(variables) {
	return query({
		operation: { name: "posts_connection", alias: "posts" },
		variables: {
			filters: { value: variables.filters, type: "PostFiltersInput", required: true },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{ nodes: POST_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
	}, null, { operationName: "CommunityPostDetail" });
}

/** @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; status: string; commentsPage: number; commentsPageSize: number; commentsSort: string }} variables */
export function buildCommunityCommentsQuery(variables) {
	return query({
		operation: { name: "posts_connection", alias: "posts" },
		variables: {
			filters: { value: variables.filters, type: "PostFiltersInput", required: true },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{
			nodes: [
				"documentId",
				"comment_count",
				{
					operation: "commentsPage",
					variables: {
						commentsPage: { value: variables.commentsPage, type: "Int", required: true, name: "page" },
						commentsPageSize: { value: variables.commentsPageSize, type: "Int", required: true, name: "pageSize" },
						commentsSort: { value: variables.commentsSort, type: "String", name: "sort" }
					},
					fields: [
						"documentId",
						"restId",
						{ author: ["documentId", "name", "avatar"] },
						"content",
						"createdAt",
						"updatedAt"
					]
				}
			]
		}]
	}, null, { operationName: "CommunityComments" });
}

/** @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string }} variables */
export function buildCommunityUpdatesQuery(variables) {
	return query({
		operation: { name: "updates_connection", alias: "updates" },
		variables: {
			filters: { value: variables.filters, type: "UpdateFiltersInput", required: true },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			sort: { value: variables.sort, type: "String", list: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{ nodes: UPDATE_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
	}, null, { operationName: "CommunityUpdates" });
}

/** @param {{ id: string }} variables */
export function buildPostByLegacyIdQuery(variables) {
	return query({
		operation: "postByLegacyId",
		variables: { id: { value: variables.id, type: "ID", required: true } },
		fields: ["documentId", "restId"]
	}, null, { operationName: "PostByLegacyId" });
}

