import { error } from "@sveltejs/kit";
import { loadScholarshipDirectory, loadScholarshipFilterOptions } from "$domains/scholarships";
import { buildScholarshipOptions } from "$domains/scholarships/filter-options.js";
import { contentServiceUnavailableStatus, isContentServiceUnavailable } from "$lib/server/content-service-status.js";

/**
 * @param {import("./$types").PageServerLoadEvent} event
 */
export async function load(event) {
	const filters = Object.fromEntries(event.url.searchParams);
	const [result, optionsResult] = await Promise.all([
		loadScholarshipDirectory({ fetch: event.fetch }, filters),
		loadScholarshipFilterOptions({ fetch: event.fetch })
	]);
	const filterOptions = optionsResult.ok ? optionsResult.data : buildScholarshipOptions();

	if (!result.ok) {
		if (isContentServiceUnavailable(result.error)) {
			return {
				scholarshipItems: [],
				pageInfo: { total: 0, page: 1, pageSize: 8, pageCount: 0 },
				filterOptions,
				filters,
				contentService: contentServiceUnavailableStatus()
			};
		}

		throw error(result.error.status || 500, result.error.message);
	}

	return {
		scholarshipItems: result.data.results,
		pageInfo: result.data.pageInfo,
		filterOptions,
		filters
	};
}
