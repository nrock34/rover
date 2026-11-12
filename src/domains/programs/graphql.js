import { query } from "gql-query-builder";

const PROGRAM_FIELDS = [
	"documentId",
	"title",
	{
		provider: [
			"documentId",
			"name",
			{ contact: ["documentId", "email", "country_code", "phone", "website", { address: ["documentId", "line_one", "line_two", "city", "state", "zip_code", "country"] }] },
			{
				university: [
					"documentId", "name", "size", "country", "state", "description", "founded", "accreditation",
					{ location: ["documentId", "city", "state_code", "state_name", "country_code", "country_name", "zip_code", "school_setting"] },
					{ contact_info: ["documentId", "phone", "street", "city", "state_code", "country_code", "country_name", "zip_code"] },
					{ academic_stats: ["documentId", "grad_rate", "num_of_majors", "ratio", "retention"] }
				]
			}
		]
	},
	"duration",
	"application_deadline",
	"application_link",
	"info_link",
	{ fields: ["documentId", "name"] },
	"language",
	"rating",
	"participants",
	"shortDescription",
	"description",
	"highlights",
	{ image: ["documentId", "source_url", { file: ["documentId", "url"] }] },
	{ gallery: ["documentId", "source_url", { file: ["documentId", "url"] }] },
	"featured",
	"publication_status",
	{ locations: ["documentId", "city", "state"] },
	{ cost: ["documentId", "program_fee", "accommodation_fee", "extra_fee", "total_fee"] },
	{ requirements: ["documentId", "gpa", "language", "prerequisites", "active_credits_needed", "level"] },
	{ accomodations: ["documentId", "location", "amenities", "description", "type"] },
	{ application_steps: ["documentId", "step", "title", "description", "deadline"] },
	{ testimonials: ["documentId", "name", "time_period", "rating", "text"] },
	{ academics: ["documentId", "courses", "trips", "class_size"] },
	"createdAt",
	"updatedAt",
	"publishedAt"
];

const PROGRAM_FILTER_FIELDS = [
	"documentId",
	{ provider: ["documentId", "name", { university: ["country", { location: ["country_name"] }] }] },
	{ fields: ["documentId", "name"] },
	"language"
];

/**
 * @param {{ filters: Record<string, unknown>; pagination: Record<string, unknown>; sort?: string[]; status: string }} variables
 * @param {boolean} [filterOptions]
 */
export function buildProgramsQuery(variables, filterOptions = false) {
	return query({
		operation: { name: "programs_connection", alias: "programs" },
		variables: {
			filters: { value: variables.filters, type: "ProgramFiltersInput" },
			pagination: { value: variables.pagination, type: "PaginationArg", required: true },
			sort: { value: variables.sort, type: "String", list: true },
			status: { value: variables.status, type: "PublicationStatus", required: true }
		},
		fields: [{ nodes: filterOptions ? PROGRAM_FILTER_FIELDS : PROGRAM_FIELDS }, { pageInfo: ["total", "page", "pageSize", "pageCount"] }]
	}, null, { operationName: "Programs" });
}

