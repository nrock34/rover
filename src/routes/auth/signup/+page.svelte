<script>
    import SignupForm from "$lib/components/forms/auth/signup-form.svelte";
    import AuthShell from "$lib/components/auth/AuthShell.svelte";
    let { data } = $props();
</script>

<AuthShell title="Create your account" description="Join the study abroad community on RomeWithMe.">
    <svelte:boundary>
    <SignupForm {data} actionName="?/signup" />
    {#snippet pending()}
        <p class="py-8 text-center text-foreground/75">Loading…</p>
    {/snippet}
    </svelte:boundary>
</AuthShell>
