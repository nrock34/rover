import { dev } from "$app/environment";
import { error, redirect } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { yup } from "sveltekit-superforms/adapters";
import {
    academicBackgroundSchema, globalBackgroundSchema,
    createAcademicBackgroundDefaults, createGlobalBackgroundDefaults,
    CURRENT_GRADUATION_YEAR, listOnboardingSteps, getOnboardingStep,
    mapAcademicBackgroundStep, mapOnboardingDraftToPayload
} from "$domains/onboarding/index.js";

function requireDevelopment() {
    if (!dev) error(404, "Not found");
}

export async function load({ url }) {
    requireDevelopment();
    const filled = url.searchParams.get("filled") === "1";
    return {
        preview: true,
        previewComplete: url.searchParams.get("complete") === "1",
        form: await superValidate(filled ? {
            studentLevel: "ungrd", university: "1", major: "History", year: CURRENT_GRADUATION_YEAR + 2
        } : createAcademicBackgroundDefaults(), yup(academicBackgroundSchema), { errors: false }),
        GlobalBackgroundForm: await superValidate(filled ? {
            travelExperience: "1to3", hasTraveledEdu: false,
            otherLanguageSpoken: "Italian", interestedRegions: ["seurope"]
        } : createGlobalBackgroundDefaults(), yup(globalBackgroundSchema), { errors: false }),
        steps: listOnboardingSteps(),
        currentStep: getOnboardingStep("academic_background"),
        universityList: [
            { id: 1, name: "Sample State University" },
            { id: 2, name: "Sample City College" },
            { id: 3, name: "Sample International University" }
        ]
    };
}

export const actions = {
    academicBackground: async ({ request }) => {
        requireDevelopment();
        const form = await superValidate(request, yup(academicBackgroundSchema));
        if (!form.valid) return fail(400, { form });
        return {
            form, success: true, nextForm: true,
            currentStep: getOnboardingStep("global_background"),
            onboardingDraft: mapOnboardingDraftToPayload({
                academicBackground: mapAcademicBackgroundStep(form.data), globalBackground: null
            })
        };
    },
    globalBackground: async ({ request }) => {
        requireDevelopment();
        const form = await superValidate(request, yup(globalBackgroundSchema));
        if (!form.valid) return fail(400, { form });
        redirect(303, "/develop-preview/onboarding?complete=1");
    }
};
