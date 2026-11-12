import { message, superValidate } from "sveltekit-superforms"
import { yup } from "sveltekit-superforms/adapters"
import { schema } from "$lib/components/forms/auth/signup-schema.js"
import { redirect } from "@sveltejs/kit"
import { mapSignupFormData, passRefreshTokenCookie, setSignedAccessCookie, signupUser } from "$domains/auth/index.js"
import { sanitizeRelativeRedirectTarget } from "$lib/auth/redirect.js"
import { isOnboardedOnlyPath } from "$lib/auth/protected-routes.js"
import { recordOutcome } from '$lib/server/analytics.js';

import { REFRESH_COOKIE_NAME, isSafeRefreshTokenCookieValue } from "$domains/auth/session-cookies.js"

/**
 * @param {import("../../../domains/auth/types.js").AuthSignupResult} result
 * @returns {import("../../../domains/auth/types.js").AuthFailure}
 */
function asAuthFailure(result) {
    return /** @type {import("../../../domains/auth/types.js").AuthFailure} */ (result)
}

/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {
    const signupForm = await superValidate(yup(schema))


    return {
        signupForm: signupForm,
        redirectTo: sanitizeSignupRedirect(url.searchParams.get("redirectTo"))
    }
}

/** @param {unknown} value */
function sanitizeSignupRedirect(value) {
    const target = sanitizeRelativeRedirectTarget(value, "")
    if (!target || target.startsWith("/auth/") || target.startsWith("/onboarding")) return ""
    return target
}


/** @type {import("./$types").Actions} */
export const actions = {
    signup: async (event) => {
        const { request, fetch, cookies, url } = event;
        const formData = await request.formData()
        const redirectTo = sanitizeSignupRedirect(formData.get("redirectTo") ?? url.searchParams.get("redirectTo"))
        const form = await superValidate(formData, yup(schema))

        if (!form.valid) {
            return message(form, { msg: "Please check the highlighted fields." }, { status: 400 })
        }

        const payload = mapSignupFormData(form.data)
        const result = await signupUser(payload, { fetch })

        if (!result.ok) {
            const failure = asAuthFailure(result)

            if (failure.error.code === "invalid_payload") {
                return message(form, {
                    msg: "We couldn't create your account. The email or username may already be in use. Please check your details."
                }, {status: 400})
            }
            if (failure.error.code === "disabled_acct") {
                return message(form, {
                    error: "disabled_acct",
                    msg: "This account is disabled, contact us if you believe this to be an error."
                }, {status: 405})
            }
            return message(form, {
                msg: "We couldn't finish creating your account. Please try signing in if you already submitted these details."
            }, { status: 503 })
        }

        await recordOutcome(event, 'signup_completed', { auth_state: 'authenticated', roles: 'member', onboarding_status: 'pending', source: 'signup_form' });
        const isHttps = url?.protocol === 'https:';
        const refreshCookieApplied = passRefreshTokenCookie(cookies, result.headers, { secureOverride: isHttps })
        // Strapi registration returns the refresh token in JSON, unlike login.
        if (!refreshCookieApplied && isSafeRefreshTokenCookieValue(result.data.refreshToken)) {
            cookies.set(REFRESH_COOKIE_NAME, result.data.refreshToken, {
                httpOnly: true,
                secure: isHttps,
                sameSite: "lax",
                path: "/",
                encode: (value) => value
            })
        }
        setSignedAccessCookie(cookies, result.data.acs_tkn, { secure: isHttps })

        if (redirectTo && !isOnboardedOnlyPath(new URL(redirectTo, url).pathname)) {
            throw redirect(303, redirectTo)
        }

        const onboardingUrl = new URL("/onboarding", url)
        if (redirectTo) onboardingUrl.searchParams.set("redirectTo", redirectTo)
        throw redirect(303, `${onboardingUrl.pathname}${onboardingUrl.search}`)
    }
}
