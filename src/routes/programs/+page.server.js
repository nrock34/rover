import { error } from "@sveltejs/kit";
import { loadProgramFilterOptions, loadProgramDirectoryPage } from "$domains/programs";
import { contentServiceUnavailableStatus, isContentServiceUnavailable } from "$lib/server/content-service-status.js";

export const load = async ({ url, data, fetch }) => {
    const filters = Object.fromEntries(url.searchParams);

    const [programsResult, optionsResult] = await Promise.all([
        loadProgramDirectoryPage(
            { fetch },
            filters
        ),
        loadProgramFilterOptions({ fetch })
    ]);

    if (!programsResult.ok) {
        if (isContentServiceUnavailable(programsResult.error)) {
            return {
                ...data,
                next: null,
                prev: null,
                results: [],
                pageInfo: { total: 0, page: 1, pageSize: 12, pageCount: 0 },
                filterOptions: optionsResult.ok ? optionsResult.data : { countries: [], providers: [], subjects: [], languages: [] },
                filters,
                contentService: contentServiceUnavailableStatus()
            };
        }

        throw error(programsResult.error.status || 500, programsResult.error.message);
    }

    return {
        ...data,
        ...programsResult.data,
        filterOptions: optionsResult.ok ? optionsResult.data : { countries: [], providers: [], subjects: [], languages: [] },
        filters
    };
};
