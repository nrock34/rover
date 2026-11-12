import { resolveApiUrl } from "../../../../core/env/server.js";

/**
 * @param {string} username
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<{ exists: boolean }>}
 */
export const userCheck = async (username, fetchFn = fetch) => {
    const response = await fetchFn(resolveApiUrl("auth/username/check"), {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ username }),
        signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error("Username check unavailable");
    const result = await response.json();
    if (typeof result?.exists !== "boolean") throw new Error("Invalid username check response");
    return { exists: result.exists };
};
