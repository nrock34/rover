<script>
    import LoginForm from "$lib/components/forms/auth/login-form.svelte";
    import AuthShell from "$lib/components/auth/AuthShell.svelte";
    let { data } = $props();
</script>

<AuthShell title="Welcome back" description="Sign in to your RomeWithMe account.">
    <LoginForm {data} actionName="?/login" />
</AuthShell>
