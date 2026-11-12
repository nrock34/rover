import { query } from "gql-query-builder";

export const POSTCARD_FIELDS = [
	"documentId",
	"title",
	"description",
	"excerpt",
	{ location: ["documentId", "city", "country"] },
	"region",
	{ author: ["documentId", "name", "avatar"] },
	"featured",
	{ category: ["documentId", "name"] },
	{ tags: ["documentId", "name"] },
	"content",
	{ banner_img: ["documentId", "public_url", "alt_text", "caption"] },
	{ gallery: ["documentId", "public_url", "alt_text", "caption"] },
	"like_count",
	"comment_count",
	"views",
	"date_published",
	"published",
	"publication_status",
	"createdAt",
	"updatedAt",
	"publishedAt"
];

/**
 * @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string; taxonomyPagination: Record<string, unknown> }} variables
 */
export function buildPostcardDirectoryQuery(variables) {
	return query([
		{
			operation: { name: "articles_connection", alias: "articles" },
			variables: {
				filters: { value: variables.filters, type: "ArticleFiltersInput" },
				pagination: { value: variables.pagination, type: "PaginationArg", required: true },
				sort: { value: variables.sort, type: "String", list: true },
				status: { value: variables.status, type: "PublicationStatus", required: true }
			},
			fields: [{ nodes: POSTCARD_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
		},
		{
			operation: { name: "articleCategories_connection", alias: "articleCategories" },
			variables: {
				taxonomyPagination: { value: variables.taxonomyPagination, type: "PaginationArg", required: true, name: "pagination" },
				status: { value: variables.status, type: "PublicationStatus", required: true }
			},
			fields: [{ nodes: ["documentId", "name"] }]
		},
		{
			operation: { name: "articleTags_connection", alias: "articleTags" },
			variables: {
				taxonomyPagination: { value: variables.taxonomyPagination, type: "PaginationArg", required: true, name: "pagination" },
				status: { value: variables.status, type: "PublicationStatus", required: true }
			},
			fields: [{ nodes: ["documentId", "name"] }]
		}
	], null, { operationName: "PostcardDirectory" });
}

/**
 * @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; status: string }} variables
 */
export function buildPostcardDetailQuery(variables) {
	return query({
		operation: { name: "articles_connection", alias: "articles" },
		variables: {
			filters: { value: variables.filters, type: "ArticleFiltersInput", required: true },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{ nodes: POSTCARD_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
	}, null, { operationName: "PostcardDetail" });
}


