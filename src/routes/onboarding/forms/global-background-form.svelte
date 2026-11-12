<script>
    import { yupClient } from "sveltekit-superforms/adapters";
    import { globalBackgroundSchema } from "../schema";
    import * as Card from "$lib/components/ui/card";
    import { superForm } from "sveltekit-superforms";
    import { ChevronLeft, ChevronRight, Check } from "lucide-svelte";
    import * as ToggleGroup from "$lib/components/ui/toggle-group";

    import backpackSvg from "$lib/assets/backpack-bag-outline-svgrepo-com.svg";
    import ticketSvg from "$lib/assets/plane-ticket-travel-svgrepo-com.svg";
    import beachSvg from "$lib/assets/beach-svgrepo-com.svg";
    import castleSvg from "$lib/assets/ancient-architecture-castle-svgrepo-com.svg";
    import thumbsUpSvg from "$lib/assets/thumbs-up-svgrepo-com.svg";

    import americasSvg from "$lib/assets/regions/globe-showing-americas-svgrepo-com.svg";
    import ausasiaSvg from "$lib/assets/regions/globe-showing-asia-australia-svgrepo-com.svg";
    import eurafricaSvg from "$lib/assets/regions/globe-showing-europe-africa-svgrepo-com.svg";

    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { onMount } from "svelte";

    import { toast } from "svelte-sonner";
    import {
        ONBOARDING_STEP_IDS,
        ONBOARDING_STORAGE_KEYS,
        readStoredJson,
        removeStoredValue
    } from "$domains/onboarding/index.js";

    let {
        data = $bindable(),
        invalidateAll,
        currentFormId = $bindable(),
        prevFormId = $bindable()
    } = $props();

    const form = superForm(data.form, {
        dataType: "json",
        multipleSubmits: "prevent",
        onError: ({ message }) => message.set({ msg: "We couldn’t finish onboarding. Check your connection and try again." }),
        validators: yupClient(globalBackgroundSchema),
        onSubmit: ({ jsonData }) => {
            const academicPayload = data.academicPayload ??
                (data.preview ? null : readStoredJson(ONBOARDING_STORAGE_KEYS.academicStep));

            jsonData({
                ...$formData,
                academicPayload
            });
        },
        onResult: ({ result }) => {
            if (result.type === "redirect" && !data.preview) {
                removeStoredValue(ONBOARDING_STORAGE_KEYS.academicFields);
                removeStoredValue(ONBOARDING_STORAGE_KEYS.academicStep);
            } else if (result.type === "failure") {
                const responseMessage = result.data?.form?.message?.msg;
                if (typeof responseMessage === "string" && responseMessage.length > 0) {
                    toast.error(responseMessage);
                }
            }
        }
    });

    const { form: formData, enhance, errors, message, submitting } = form;
    let heading;
    function goBack() {
        data.GlobalBackgroundForm = { ...data.form, data: $formData };
        data.form = data.prevForm;
        currentFormId = ONBOARDING_STEP_IDS.academic;
    }

    const travelExperienceOptions = [
        { label: "0 countries", value: "none", icon: backpackSvg },
        { label: "1-3 countries", value: "1to3", icon: beachSvg },
        { label: "4-7 countries", value: "4to7", icon: ticketSvg },
        { label: "8+ countries", value: "8plus", icon: castleSvg }
    ];

    const regionOptions = [
        { label: "Americas", value: "americas", icon: americasSvg },
        { label: "West Asia", value: "wasia", icon: ausasiaSvg },
        { label: "East Asia", value: "easia", icon: ausasiaSvg },
        { label: "Northern Europe", value: "neurope", icon: eurafricaSvg },
        { label: "Southern Europe", value: "seurope", icon: eurafricaSvg },
        { label: "Northern Africa", value: "nafrica", icon: eurafricaSvg },
        { label: "Southern Africa", value: "safrica", icon: eurafricaSvg },
        { label: "Australia", value: "australia", icon: ausasiaSvg }
    ];

    let formValid = $derived.by(() => {
        const interestedRegions = Array.isArray($formData.interestedRegions)
            ? $formData.interestedRegions.filter(Boolean)
            : [];
        const otherLanguage = typeof $formData.otherLanguageSpoken === "string"
            ? $formData.otherLanguageSpoken.trim()
            : "";

        return Boolean($formData.travelExperience) &&
            typeof $formData.hasTraveledEdu === "boolean" &&
            interestedRegions.length > 0 &&
            otherLanguage.length <= 80;
    });

    onMount(() => {
        heading?.focus({ preventScroll: true });
        if (data.preview) return;
        const academicBackgroundFormData = readStoredJson(
            ONBOARDING_STORAGE_KEYS.academicFields
        );
        const academicPayload = readStoredJson(
            ONBOARDING_STORAGE_KEYS.academicStep
        );

        if (academicPayload) {
            data.academicPayload = academicPayload;
        }

        if (!academicBackgroundFormData) {
            currentFormId = prevFormId || ONBOARDING_STEP_IDS.academic;
            data.form = data.prevForm;
            invalidateAll();
            toast.warning("We could not recover your first onboarding step. Please try again.");
        }
    });
</script>


<Card.Root class="onboarding-card">
    <Card.Header class="onboarding-card-heading">
        <Card.Title><h1 bind:this={heading} tabindex="-1">Travel Experience & Global Interests</h1></Card.Title>
        <Card.Description>Share where you’ve been and where you’d like to go.</Card.Description>
    </Card.Header>
    <Card.Content class="onboarding-card-content">
        <form method="POST" action="?/globalBackground" use:enhance aria-busy={$submitting}>
            <div class="onboarding-fields onboarding-global-fields">
                <fieldset class="onboarding-fieldset">
                    <legend id="travel-question">How many different countries have you been to?</legend>
                    <ToggleGroup.Root bind:value={$formData.travelExperience} name="travelExperience" aria-labelledby="travel-question" aria-describedby="travel-error" type="single" class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {#each travelExperienceOptions as opt}
                            <ToggleGroup.Item class="onboarding-choice" value={opt.value}>
                                <img alt="" class="onboarding-option-image" src={opt.icon} />
                                <span>{opt.label}</span><Check class="choice-check size-4" aria-hidden="true" />
                            </ToggleGroup.Item>
                        {/each}
                    </ToggleGroup.Root>
                    <p id="travel-error" class="onboarding-error">{($errors.travelExperience ?? []).join(' ')}</p>
                </fieldset>
                <fieldset class="onboarding-fieldset">
                    <legend id="education-question">Have you ever participated in an educational program abroad?</legend>
                    <ToggleGroup.Root bind:value={$formData.hasTraveledEdu} onValueChange={() => form.validate("hasTraveledEdu")} name="hasTraveledEdu" aria-labelledby="education-question" aria-describedby="education-error" type="single" class="grid grid-cols-2 gap-3">
                        <ToggleGroup.Item class="onboarding-choice onboarding-yes-no" value={true}>
                            <img alt="" class="onboarding-option-image" src={thumbsUpSvg} />Yes<Check class="choice-check size-4" aria-hidden="true" />
                        </ToggleGroup.Item>
                        <ToggleGroup.Item class="onboarding-choice onboarding-yes-no" value={false}>
                            <img alt="" class="onboarding-option-image -rotate-180" src={thumbsUpSvg} />No<Check class="choice-check size-4" aria-hidden="true" />
                        </ToggleGroup.Item>
                    </ToggleGroup.Root>
                    <p id="education-error" class="onboarding-error">{($errors.hasTraveledEdu ?? []).join(' ')}</p>
                </fieldset>
                <div class="onboarding-field">
                    <label for="otherLanguageSpoken">Do you speak or want to learn another language? <span class="onboarding-optional">Optional</span></label>
                    <Input id="otherLanguageSpoken" bind:value={$formData.otherLanguageSpoken} class="h-11" placeholder="e.g. Italian, Spanish" name="otherLanguageSpoken" maxlength={80} aria-describedby="language-help language-error" aria-invalid={Boolean($errors.otherLanguageSpoken?.length)} />
                    <p id="language-help" class="onboarding-help">Include languages you speak or would like to learn.</p>
                    <p id="language-error" class="onboarding-error">{($errors.otherLanguageSpoken ?? []).join(' ')}</p>
                </div>
                <fieldset class="onboarding-fieldset">
                    <legend id="regions-question">What regions are you interested in?</legend>
                    <p id="regions-help" class="onboarding-help mb-3">Select all that interest you.</p>
                    <ToggleGroup.Root bind:value={$formData.interestedRegions} onValueChange={() => form.validate("interestedRegions")} name="interestedRegions" aria-labelledby="regions-question" aria-describedby="regions-help regions-error" type="multiple" class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {#each regionOptions as opt}
                            <ToggleGroup.Item class="onboarding-choice" value={opt.value}>
                                <img alt="" class="onboarding-option-image" src={opt.icon} />
                                <span>{opt.label}</span><Check class="choice-check size-4" aria-hidden="true" />
                            </ToggleGroup.Item>
                        {/each}
                    </ToggleGroup.Root>
                    <p id="regions-error" class="onboarding-error">{($errors.interestedRegions ?? []).join(' ')}</p>
                </fieldset>
            </div>
            {#if $message?.msg}<p role="alert" class="onboarding-error mt-4">{$message.msg}</p>{/if}
            <div class="onboarding-actions">
                <Button type="button" variant="outline" onclick={goBack} disabled={$submitting} class="h-11"><ChevronLeft aria-hidden="true" />Back</Button>
                <Button disabled={!formValid || $submitting} type="submit" class="h-11">{$submitting ? "Finishing…" : "Finish onboarding"}<ChevronRight aria-hidden="true" /></Button>
            </div>
            {#if !formValid}<p class="onboarding-help mt-3">Choose your travel experience, study abroad experience, and at least one region to continue.</p>{/if}
        </form>
    </Card.Content>
</Card.Root>
