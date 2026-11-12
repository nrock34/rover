<script>
    import { Input } from "$lib/components/ui/input";
    import * as Form from "$lib/components/ui/form";
    import { superForm } from "sveltekit-superforms";
    import { yupClient } from "sveltekit-superforms/adapters";
    import { schema } from "./login-schema";

    let { data, actionName } = $props();
    const form = superForm(data.loginForm, {
        dataType: "json",
        validators: yupClient(schema),
        multipleSubmits: "prevent",
        onError: ({ message }) => {
            message.set({ msg: "We couldn't sign you in. Check your connection and try again." });
        }
    });
    const { form: formData, enhance, message, submitting } = form;
</script>

<form method="POST" action={actionName} use:enhance aria-busy={$submitting} class="flex flex-col gap-3">
    <input type="hidden" name="redirectTo" value={data?.redirectTo ?? ""} />
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
    </Form.Field>
    <Form.Field name="password" {form}>
        <Form.Control>
            {#snippet children({ props })}
                <div class="grid gap-1.5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <Form.Label>Password</Form.Label>
                        <a href="##" class="text-sm underline underline-offset-4">Forgot your password?</a>
                    </div>
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
    <Form.Button disabled={$submitting} class="h-10 w-full text-sm font-semibold">
        {$submitting ? "Signing in…" : "Sign in"}
    </Form.Button>
    <p class="border-t border-border pt-3 text-center text-sm text-foreground/75">
        New to RomeWithMe?
        <a data-analytics-event="signup_clicked" data-analytics-location="login" href={data?.redirectTo ? `/auth/signup?redirectTo=${encodeURIComponent(data.redirectTo)}` : "/auth/signup"} class="font-semibold text-foreground underline underline-offset-4">Create an account</a>
    </p>
</form>
