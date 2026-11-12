<script>
    import { untrack } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import GlobeLogo from "$lib/assets/logos/VX78WS01.svelte";
    import { Book, Check } from "lucide-svelte";
    import { ONBOARDING_STEP_IDS } from "$domains/onboarding/index.js";
    import { isOnboardedOnlyPath } from "$lib/auth/protected-routes.js";
    import AcademicBackgroundForm from "./forms/academic-background-form.svelte";
    import GlobalBackgroundForm from "./forms/global-background-form.svelte";
    import { Skeleton } from '$lib/components/ui/skeleton';

    import "$lib/styles/onboarding.css";

    let { data } = $props();

    let prevFormId = $state("");
    let currentFormId = $state(ONBOARDING_STEP_IDS.academic);
    let CurrentForm = $derived.by(() => {
        if (currentFormId === ONBOARDING_STEP_IDS.academic) {
            return AcademicBackgroundForm;
        }

        if (currentFormId === ONBOARDING_STEP_IDS.global) {
            return GlobalBackgroundForm;
        }

        return AcademicBackgroundForm;
    });

    const studentOptions = [
        { label: "Undergraduate", id: "ungrd", icon: Book },
        { label: "Graduate", id: "grad", icon: Book },
        { label: "Alumni", id: "almn", icon: Book }
    ];

    let wizardData = $state(untrack(() => ({
        studentOptions,
        ...data
    })));
    const laterTarget = $derived(data.redirectTo || '/');
    const laterHref = $derived(
        isOnboardedOnlyPath(new URL(laterTarget, 'https://romewithme.com').pathname)
            ? '/'
            : laterTarget
    );
</script>

<div class="onboarding-shell">
    <div class="onboarding-content">
        <a href="/" class="onboarding-brand" aria-label="RomeWithMe home">
            <div class="flex items-center justify-center gap-3">
                <GlobeLogo class="onboarding-logo stroke-primary fill-primary" />
                <div class="brand-lockup-tight flex flex-col">
                    <span class="onboarding-brand-name">RomeWithMe</span>
                    <p class="onboarding-tagline">Grow Roots in New Places</p>
                </div>
            </div>
        </a>
        <ol class="onboarding-progress" aria-label="Onboarding progress">
            <li class:complete={currentFormId === ONBOARDING_STEP_IDS.global} aria-current={currentFormId === ONBOARDING_STEP_IDS.academic ? "step" : undefined}>
                <span class="step-number" aria-hidden="true">{#if currentFormId === ONBOARDING_STEP_IDS.global}<Check class="size-4" />{:else}1{/if}</span>
                <span>Academic background</span>
            </li>
            <li aria-current={currentFormId === ONBOARDING_STEP_IDS.global ? "step" : undefined}>
                <span class="step-number" aria-hidden="true">2</span><span>Travel & interests</span>
            </li>
        </ol>
        <p class="sr-only" role="status">Step {currentFormId === ONBOARDING_STEP_IDS.academic ? 1 : 2} of 2</p>
        <a class="onboarding-later" href={laterHref}>I'll do this later</a>
        <svelte:boundary>
            
            <CurrentForm
                invalidateAll={() => {
                    invalidateAll();
                }}
                bind:currentFormId
                bind:prevFormId
                bind:data={wizardData}
            />
    
            {#snippet pending()}
                <Skeleton class="bg-muted-foreground/30 h-48 w-full shadow-sm" />
            {/snippet}
        </svelte:boundary>
    </div>
</div>
