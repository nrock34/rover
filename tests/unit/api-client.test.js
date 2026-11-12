import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestGraphql } from "../../src/core/graphql/client.js";

const operation = {
	query: "query ReadPostcard($id: ID!) { postcard(documentId: $id) { documentId title } }",
	operationName: "ReadPostcard",
	variables: { id: "postcard-42" }
};

describe("GraphQL API client", () => {
	beforeEach(() => vi.stubEnv("STRAPI_GRAPHQL_URL", "https://cms.example.test/graphql"));
	afterEach(() => vi.unstubAllEnvs());

	it("returns the requested record from a successful response", async () => {
		const postcard = { documentId: "postcard-42", title: "A morning in Rome" };
		const fetchFn = async () => Response.json({ data: { postcard } });

		await expect(requestGraphql({ ...operation, fetchFn })).resolves.toMatchObject({
			ok: true,
			status: 200,
			data: { postcard }
		});
	});

	it("reports a GraphQL execution error even when HTTP succeeds and partial data is present", async () => {
		const fetchFn = async () => Response.json({
			data: { postcard: { documentId: "postcard-42", title: null } },
			errors: [{
				message: "Forbidden",
				path: ["postcard", "title"],
				extensions: { code: "FORBIDDEN", exception: { stacktrace: ["internal details"] } }
			}]
		});

		const result = await requestGraphql({ ...operation, fetchFn });
		expect(result).toMatchObject({
			ok: false,
			status: 502,
			error: {
				code: "upstream_http_error",
				details: {
					operationName: "ReadPostcard",
					errors: [{ message: "Forbidden", path: ["postcard", "title"], code: "FORBIDDEN" }]
				}
			}
		});
		expect(result).not.toHaveProperty("data");
		expect(JSON.stringify(result)).not.toContain("internal details");
	});

	it("returns a controlled network failure when fetch rejects", async () => {
		const fetchFn = async () => {
			throw new TypeError("Connection refused");
		};

		await expect(requestGraphql({ ...operation, fetchFn })).resolves.toMatchObject({
			ok: false,
			status: 0,
			error: { code: "network_error", status: 0 }
		});
	});
});
