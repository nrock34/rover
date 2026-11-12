import { error } from "@sveltejs/kit";
import { requestGraphql } from "../../core/graphql/client.js";

const query = `query UniversityOptions($page: Int!) {
    universities_connection(pagination: { page: $page, pageSize: 100 }, sort: ["name:asc"]) {
        nodes { restId name }
        pageInfo { pageCount }
    }
}`;

/** @param {typeof fetch} fetchFn @returns {Promise<Array<{ id: number; name: string }>>} */
export async function loadUniversityOptions(fetchFn) {
    const options = [];
    let pageCount = 1;
    for (let page = 1; page <= pageCount; page++) {
        const result = await requestGraphql({ fetchFn, query, variables: { page }, operationName: "UniversityOptions" });
        if (!result.ok) throw error(502, "Failed to load universities. Please try again.");
        const data = /** @type {{ universities_connection?: { nodes?: Array<{ restId: string; name: string }>; pageInfo?: { pageCount: number } } }} */ (result.data);
        const connection = data?.universities_connection;
        if (!Array.isArray(connection?.nodes) || !Number.isInteger(connection.pageInfo?.pageCount)) {
            throw error(502, "Invalid university options response.");
        }
        pageCount = connection.pageInfo.pageCount;
        for (const university of connection.nodes) {
            const id = Number(university.restId);
            if (!Number.isSafeInteger(id) || id <= 0 || typeof university.name !== "string") {
                throw error(502, "Invalid university option.");
            }
            options.push({ id, name: university.name });
        }
    }
    return options;
}
