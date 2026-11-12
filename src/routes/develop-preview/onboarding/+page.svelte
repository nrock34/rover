<script>
    import "$lib/styles/onboarding.css";
    import OnboardingPage from "../../onboarding/+page.svelte";
    import { Button } from "$lib/components/ui/button";
    let { data } = $props();
</script>

<svelte:head><title>Onboarding preview | RomeWithMe</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

{#if data.previewComplete}
    <main class="grid min-h-screen place-items-center bg-muted p-6">
        <div class="flex max-w-md flex-col items-center gap-4 text-center">
            <h1 class="text-2xl font-semibold">Onboarding preview complete</h1>
            <p class="text-muted-foreground">Both steps passed validation. No profile information was saved.</p>
            <Button href="/develop-preview/onboarding">Restart preview</Button>
        </div>
    </main>
{:else}
    <div class="flex flex-wrap items-center justify-center gap-3 bg-muted px-4 pt-4 text-sm">
        <p class="text-muted-foreground">Development preview · Changes are not saved.</p>
        <a class="underline underline-offset-4" href="/develop-preview/onboarding?filled=1" data-sveltekit-reload>Use sample answers</a>
        <a class="underline underline-offset-4" href="/develop-preview/onboarding" data-sveltekit-reload>Start empty</a>
    </div>
    <OnboardingPage {data} />
{/if}
