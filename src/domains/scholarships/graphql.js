import { query } from "gql-query-builder";

const SCHOLARSHIP_FIELDS = [
	"documentId",
	"name",
	"summary",
	"description",
	"categories",
	{ provider: ["documentId", "name"] },
	"link",
	"lower_bound",
	"upper_bound",
	{ requirements: ["documentId", "eligibility", "field", "grad_year", "study_country"] },
	"benefits",
	"deadline",
	"status",
	"featured",
	"rating",
	{ image: ["documentId", "source_url", { file: ["documentId", "url"] }] },
	{ gallery: ["documentId", "source_url", { file: ["documentId", "url"] }] },
	{ events: ["documentId", "name", "date"] },
	{ application_steps: ["documentId", "step", "title", "description", "complete_by"] },
	"createdAt",
	"updatedAt",
	"publishedAt"
];

const SCHOLARSHIP_FILTER_FIELDS = [
	"documentId",
	"categories",
	{ provider: ["documentId", "name"] },
	{ requirements: ["field", "grad_year", "study_country"] }
];

/**
 * @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string }} variables
 * @param {boolean} [filterOptions]
 */
export function buildScholarshipsQuery(variables, filterOptions = false) {
	return query({
		operation: { name: "scholarships_connection", alias: "scholarships" },
		variables: {
			filters: { value: variables.filters, type: "ScholarshipFiltersInput" },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			sort: { value: variables.sort, type: "String", list: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{ nodes: filterOptions ? SCHOLARSHIP_FILTER_FIELDS : SCHOLARSHIP_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
	}, null, { operationName: "Scholarships" });
}
