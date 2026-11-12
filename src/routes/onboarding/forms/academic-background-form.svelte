<script>
    import * as ToggleGroup from "$lib/components/ui/toggle-group";
    import UniversitySelect from "$lib/components/forms/utils/UniversitySelect.svelte";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { superForm } from "sveltekit-superforms/client";
    import { yupClient } from "sveltekit-superforms/adapters";
    import { academicBackgroundSchema } from "../schema";
    import * as Form from "$lib/components/ui/form";
    import { Button } from "$lib/components/ui/button";
    import { ChevronRight, Check } from "lucide-svelte";
    import {
        CURRENT_GRADUATION_YEAR,
        MAX_GRADUATION_YEAR,
        MIN_GRADUATION_YEAR,
        ONBOARDING_STEP_IDS,
        ONBOARDING_STORAGE_KEYS,
        writeStoredJson
    } from "$domains/onboarding/index.js";

    let {
        data = $bindable(),
        currentFormId = $bindable(),
        prevFormId = $bindable()
    } = $props();

    let { studentOptions } = data;

    const form = superForm(data.form, {
        dataType: "json",
        invalidateAll: false,
        multipleSubmits: "prevent",
        onError: ({ message }) => message.set({ msg: "We couldn’t continue. Check your connection and try again." }),
        validators: yupClient(academicBackgroundSchema),
        onResult: ({ result }) => {
            if (result.data?.nextForm && result.data?.success) {
                prevFormId = ONBOARDING_STEP_IDS.academic;
                currentFormId = ONBOARDING_STEP_IDS.global;

                data.prevForm = result.data.form;
                data.form = data.GlobalBackgroundForm;
                data.academicPayload = result.data.onboardingDraft?.academic_background ?? null;

                if (!data.preview) {
                    writeStoredJson(
                        ONBOARDING_STORAGE_KEYS.academicFields,
                        result.data.form.data
                    );
                    writeStoredJson(
                        ONBOARDING_STORAGE_KEYS.academicStep,
                        result.data.onboardingDraft?.academic_background ?? null
                    );
                }
            }
        }
    });

    const studentLang = {
        current: {
            school: "What school do you currently attend?",
            major: "What is your major?",
            yr: "Expected Graduation Year"
        },
        alumni: {
            school: "What school did you attend?",
            major: "What did you major in?",
            yr: "Graduating Year"
        }
    };

    const { form: formData, enhance, errors, message, submitting } = form;

    let isFormValid = $derived.by(() => {
        const university = typeof $formData.university === "string" ? $formData.university.trim() : "";
        const major = typeof $formData.major === "string" ? $formData.major.trim() : "";
        const year = Number($formData.year);
        const hasValidUniversity = university.length > 0 &&
            (/^\d+$/u.test(university) || university.length >= 2);

        return Boolean($formData.studentLevel) &&
            hasValidUniversity &&
            major.length >= 2 &&
            Number.isInteger(year) &&
            year >= MIN_GRADUATION_YEAR &&
            year <= MAX_GRADUATION_YEAR;
    });
</script>

<Card.Root class="onboarding-card">
    <Card.Header class="onboarding-card-heading">
        <Card.Title><h1>Your Academic Background</h1></Card.Title>
        <Card.Description>Tell us a little about your studies.</Card.Description>
    </Card.Header>
    <Card.Content class="onboarding-card-content">
        <form method="POST" action="?/academicBackground" use:enhance aria-busy={$submitting}>
            <Form.Field {form} name="studentLevel">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label class="onboarding-question">What status best represents you?</Form.Label>
                        <ToggleGroup.Root {...props} onValueChange={() => form.validate("studentLevel")} bind:value={$formData.studentLevel} type="single" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {#each studentOptions as option, idx}
                                <ToggleGroup.Item class={`onboarding-choice onboarding-student ${idx === studentOptions.length - 1 ? "col-span-2 sm:col-span-1" : ""}`} value={option.id}>
                                    <option.icon class="size-5" aria-hidden="true" />
                                    <span>{option.label}</span><Check class="choice-check size-4" aria-hidden="true" />
                                </ToggleGroup.Item>
                            {/each}
                        </ToggleGroup.Root>
                    {/snippet}
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>
            {#if $formData.studentLevel}
                <div class="onboarding-fields onboarding-reveal">
                    <div class="onboarding-field">
                        <label for="university">{$formData.studentLevel === "almn" ? studentLang.alumni.school : studentLang.current.school}</label>
                        {#if data.universityList?.length}
                            <UniversitySelect name="university" onchange={() => form.validate("university")} bind:value={$formData.university} className="h-11" closeOnSelect={true} formProps={{ id: "university", "aria-invalid": Boolean($errors.university?.length), "aria-describedby": "university-error" }} {data} />
                        {:else}
                            <Input id="university" bind:value={$formData.university} name="university" class="h-11" placeholder="Enter your university" aria-invalid={Boolean($errors.university?.length)} aria-describedby="university-error" />
                        {/if}
                        <p id="university-error" class="onboarding-error">{($errors.university ?? []).join(' ')}</p>
                    </div>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <div class="onboarding-field">
                            <label for="major">{$formData.studentLevel === "almn" ? studentLang.alumni.major : studentLang.current.major}</label>
                            <Input id="major" bind:value={$formData.major} name="major" class="h-11" placeholder="e.g. History" aria-invalid={Boolean($errors.major?.length)} aria-describedby="major-error" />
                            <p id="major-error" class="onboarding-error">{($errors.major ?? []).join(' ')}</p>
                        </div>
                        <div class="onboarding-field">
                            <label for="year">{$formData.studentLevel === "almn" ? studentLang.alumni.yr : studentLang.current.yr}</label>
                            <Input id="year" bind:value={$formData.year} name="year" type="number" class="h-11" min={String(MIN_GRADUATION_YEAR)} max={String(MAX_GRADUATION_YEAR)} placeholder={String(CURRENT_GRADUATION_YEAR)} aria-invalid={Boolean($errors.year?.length)} aria-describedby="year-error" />
                            <p id="year-error" class="onboarding-error">{($errors.year ?? []).join(' ')}</p>
                        </div>
                    </div>
                    {#if $message?.msg}<p role="alert" class="onboarding-error">{$message.msg}</p>{/if}
                    <div class="onboarding-actions">
                        <p class="onboarding-help">{isFormValid ? "Next: travel experience & interests" : "Complete the fields above to continue."}</p>
                        <Button disabled={!isFormValid || $submitting} type="submit" class="h-11">{$submitting ? "Continuing…" : "Next"}<ChevronRight aria-hidden="true" /></Button>
                    </div>
                </div>
            {/if}
        </form>
    </Card.Content>
</Card.Root>
