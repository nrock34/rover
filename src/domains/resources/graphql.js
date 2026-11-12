import { query } from "gql-query-builder";

const COMMON_FIELDS = [
	"documentId",
	"title",
	"description",
	"rating",
	"views",
	{ author: ["documentId", "name", "avatar"] },
	"featured",
	"publication_status",
	"thumbnail",
	"downloads",
	{ tags: ["documentId", "name"] },
	"createdAt",
	"updatedAt",
	"publishedAt"
];

/** @typedef {{ key: string; category: string | null; type: string | null; operationName: string; connection: string; filterType: string; extraFields: string[] }} ResourceRoot */
/** @typedef {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string }} ResourceQueryVariables */

/** @type {readonly ResourceRoot[]} */
export const RESOURCE_ROOTS = Object.freeze([
	{
		key: "resources",
		category: null,
		type: null,
		operationName: "ResourcePage",
		connection: "resources",
		filterType: "ResourceFiltersInput",
		extraFields: ["category", "type", "kind", "content_format", "content_url", "body"]
	},
	{
		key: "academic",
		category: "academic",
		type: "pdf",
		operationName: "AcademicResourcePage",
		connection: "academicResources",
		filterType: "AcademicResourceFiltersInput",
		extraFields: ["content", "page_content"]
	},
	{
		key: "cultural",
		category: "cultural",
		type: "pdf",
		operationName: "CulturalResourcePage",
		connection: "culturalResources",
		filterType: "CulturalResourceFiltersInput",
		extraFields: ["content", "page_content"]
	},
	{
		key: "guides",
		category: "guides",
		type: "page",
		operationName: "GuidePage",
		connection: "guides",
		filterType: "GuideFiltersInput",
		extraFields: ["content", "page_content"]
	},
	{
		key: "itineraries",
		category: "itineraries",
		type: "page",
		operationName: "ItineraryPage",
		connection: "itineraries",
		filterType: "ItineraryFiltersInput",
		extraFields: ["page_content"]
	},
	{
		key: "tips",
		category: "tips",
		type: "page",
		operationName: "TipPage",
		connection: "tips",
		filterType: "TipFiltersInput",
		extraFields: ["page_content"]
	}
]);

/**
 * @param {ResourceRoot} root
 * @param {ResourceQueryVariables} variables
 */
export function buildResourceQuery(root, variables) {
	return query({
		operation: { name: `${root.connection}_connection`, alias: "items" },
		variables: {
			filters: { value: variables.filters, type: root.filterType },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			sort: { value: variables.sort, type: "String", list: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [
			{ nodes: [...COMMON_FIELDS, ...root.extraFields] },
			{ pageInfo: ["total", "page", "pageSize", "pageCount"] }
		]
	}, null, { operationName: root.operationName });
}

