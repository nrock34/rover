<script>
    import { Input } from "$lib/components/ui/input";
    import * as Form from "$lib/components/ui/form";
    import { superForm } from "sveltekit-superforms";
    import { yupClient } from "sveltekit-superforms/adapters";
    import { schema } from "./signup-schema";

    let { data, actionName } = $props();
    const form = superForm(data.signupForm, {
        dataType: "json",
        validators: yupClient(schema),
        multipleSubmits: "prevent",
        onError: ({ message }) => {
            message.set({ msg: "We couldn't finish creating your account. Check your connection, or try signing in if you already submitted these details." });
        }
    });
    const { form: formData, enhance, message, submitting } = form;
</script>

<form data-analytics-form="signup" method="POST" action={actionName} use:enhance aria-busy={$submitting} class="flex flex-col gap-3">
    <input type="hidden" name="redirectTo" value={data?.redirectTo ?? ""} />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <Form.Field name="first_name" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <Form.Label>First name</Form.Label>
                    <Input {...props} bind:value={$formData.first_name} type="text" class="h-10 text-sm md:text-sm" required />
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field name="last_name" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <Form.Label>Last name</Form.Label>
                    <Input {...props} bind:value={$formData.last_name} type="text" class="h-10 text-sm md:text-sm" required />
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    </div>
    <Form.Field name="username" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <Form.Label>Username</Form.Label>
                    <Input {...props} bind:value={$formData.username} type="text" class="h-10 text-sm md:text-sm" required />
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
        {#if $message?.errors?.username}
            <p class="text-sm text-destructive" role="alert">{$message.errors.username}</p>
        {/if}
    </Form.Field>
    <Form.Field name="email" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <Form.Label>Email</Form.Label>
                    <Input {...props} bind:value={$formData.email} type="email" class="h-10 text-sm md:text-sm" required />
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
        {#if $message?.errors?.email}
            <p class="text-sm text-destructive" role="alert">{$message.errors.email}</p>
        {/if}
    </Form.Field>
    <Form.Field name="password" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <Form.Label>Password</Form.Label>
                    <div class="relative">
                        <Input {...props} bind:value={$formData.password} type="password"
                            class="h-10 text-sm md:text-sm" required />
                    </div>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    {#if $message?.msg}
        <p role="alert" class="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {$message.msg}
        </p>
    {/if}
    <p class="text-sm leading-relaxed text-foreground/75">
        By creating an account, you agree to our <a href="/tos" class="underline underline-offset-4">Terms of Service</a>
        and <a href="/pp" class="underline underline-offset-4">Privacy Policy</a>.
    </p>
    <Form.Button disabled={$submitting} class="h-10 w-full text-sm font-semibold">
        {$submitting ? "Creating account…" : "Create account"}
    </Form.Button>
    <p class="border-t border-border pt-3 text-center text-sm text-foreground/75">
        Already have an account?
        <a href={data?.redirectTo ? `/auth/login?redirectTo=${encodeURIComponent(data.redirectTo)}` : "/auth/login"} class="font-semibold text-foreground underline underline-offset-4">Sign in</a>
    </p>
</form>
