import { asHttpFailure, buildApiUrl, createHttpFailureMapper, withBearerAuth } from "../../core/domain/http.js";
import { coerceDomainError, createDomainError } from "../../core/domain/errors.js";
import { requestJson } from "../../core/http/client.js";
import { ONBOARDED_ROLE, normalizeRoles } from "../../lib/auth/rbac.js";

const onboardingHttpFailureMapper = createHttpFailureMapper({
	fallbackCode: "upstream_error",
	fallbackMessage: "Failed to save onboarding information.",
	network: {
		code: "network_error",
		message: "The onboarding service is unreachable.",
		status: 503
	},
	invalidResponse: {
		code: "invalid_response",
		message: "The onboarding service returned an invalid response.",
		status: 502
	}
});

/**
 * @param {unknown} value
 * @returns {import("./types.js").OnboardingDomainError}
 */
function asDomainError(value) {
	return /** @type {import("./types.js").OnboardingDomainError} */ (
		coerceDomainError(value, {
			missingEnvCode: "missing_env",
			fallbackCode: "upstream_error",
			fallbackMessage: "Unexpected onboarding failure."
		})
	);
}

/**
 * @param {import("../../core/http/client.js").HttpFailure} failure
 * @param {string} message
 * @returns {import("./types.js").OnboardingDomainError}
 */
function mapHttpFailure(failure, message) {
	return /** @type {import("./types.js").OnboardingDomainError} */ (
		onboardingHttpFailureMapper(failure, { fallbackMessage: message })
	);
}

/**
 * Sends the full draft to the authenticated completion endpoint. The server
 * owns both persistence and the role grant, so a successful HTTP response is
 * not enough unless it confirms the onboarded-member role.
 *
 * @param {import("./types.js").OnboardingPayload} payload
 * @param {import("./types.js").OnboardingSubmitDeps} deps
 * @returns {Promise<import("./types.js").OnboardingSubmitResult>}
 */
export async function submitOnboarding(payload, { fetch, accessToken }) {
	if (
		!payload.academic_background || !payload.global_background ||
		!Array.isArray(payload.completed_steps) ||
		!payload.completed_steps.includes("academic_background") ||
		!payload.completed_steps.includes("global_background")
	) {
		return {
			ok: false,
			error: createDomainError(
				"incomplete_draft",
				400,
				"Complete every onboarding step before continuing."
			)
		};
	}

	try {
		const response = await requestJson(buildApiUrl("users/me/onboarding"), {
			method: "POST",
			fetchFn: fetch,
			headers: withBearerAuth(accessToken),
			body: payload
		});

		if (!response.ok) {
			return {
				ok: false,
				error: mapHttpFailure(
					asHttpFailure(response),
					"We couldn't finish onboarding. Please try again."
				)
			};
		}

		const data = response.data;
		const user = data && typeof data === "object" && "user" in data ? data.user : null;
		const rawRoles = user && typeof user === "object" && "roles" in user ? user.roles : null;
		if (!normalizeRoles(rawRoles).includes(ONBOARDED_ROLE)) {
			return {
				ok: false,
				error: createDomainError(
					"invalid_response",
					502,
					"Your details were submitted, but we couldn't confirm your member access. Please try again."
				)
			};
		}

		return {
			ok: true,
			data: {
				completedSteps: ["academic_background", "global_background"]
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: asDomainError(err)
		};
	}
}

/**
 * @param {import("./types.js").OnboardingSubmitResult} result
 * @returns {import("./types.js").OnboardingSubmitFailure}
 */
export function asOnboardingFailure(result) {
	return /** @type {import("./types.js").OnboardingSubmitFailure} */ (result);
}
