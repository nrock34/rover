<script>
    import Globe from "$lib/assets/logos/VX78WS01.svelte";
    let { title, description, children } = $props();
</script>

<svelte:head>
    <title>{title} | RomeWithMe</title>
    <meta name="description" content={description} />
</svelte:head>

<div class="auth-page">
    <aside class="auth-world" aria-label="RomeWithMe">
        <img class="auth-photo" src="/landing-test/rome-street-sunset.webp" alt="" />
        <div class="auth-wash" aria-hidden="true"></div>
        <a href="/" class="auth-brand" aria-label="RomeWithMe home">
            <Globe class="size-12 fill-current stroke-current" />
            <span>RomeWithMe</span>
        </a>
        <div class="auth-story">
            <p class="auth-motto">Grow roots<br /> in new <em>places.</em></p>
            <div class="auth-caption"><span>Rome, Italy</span><span>Make yourself at home.</span></div>
        </div>
    </aside>
    <div class="auth-content">
        <div class="auth-form-wrap">
            <section aria-labelledby="auth-title">
                <div class="auth-heading">
                    <div class="auth-mark" aria-hidden="true"></div>
                    <h1 id="auth-title">{title}</h1>
                    <p>{description}</p>
                </div>
                {@render children()}
            </section>
            <nav aria-label="Legal" class="auth-legal">
                <a href="/tos">Terms of Service</a>
                <a href="/pp">Privacy Policy</a>
            </nav>
        </div>
    </div>
</div>

<style>
    .auth-page {
        --auth-paper: color-mix(in oklch, var(--accent) 45%, var(--background));
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100svh;
        background: var(--auth-paper);
    }
    .auth-world { position: relative; isolation: isolate; display: flex; flex-direction: column; justify-content: space-between; min-height: 100%; padding: clamp(2rem, 4vw, 4rem); color: var(--primary-foreground); overflow: hidden; }
    .auth-photo { position: absolute; inset: 0; z-index: -3; width: 100%; height: 100%; object-fit: cover; object-position: 48% center; }
    .auth-wash { position: absolute; inset: 0; z-index: -2; background:
        linear-gradient(180deg, color-mix(in oklch, var(--foreground) 55%, transparent), transparent 35%, color-mix(in oklch, var(--foreground) 85%, transparent)),
        linear-gradient(120deg, color-mix(in oklch, var(--primary) 55%, transparent), transparent 65%); }
    .auth-world::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, transparent 75%, color-mix(in oklch, var(--primary) 18%, transparent)); pointer-events: none; }
    .auth-brand { display: inline-flex; align-items: center; align-self: flex-start; gap: .5rem; font-size: 1.5rem; font-weight: 700; letter-spacing: -.04em; }
    .auth-story { padding-top: 10rem; }
    .auth-motto { font-family: var(--font-display); font-size: 1.5rem; line-height: 1.04; letter-spacing: -.055em; font-weight: 500; margin: 0 0 1.5rem; }
    .auth-motto em { font-weight: 400; }
    .auth-caption { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .75rem; padding-top: 1rem; border-top: 1px solid color-mix(in oklch, var(--primary-foreground) 40%, transparent); font-size: .8rem; }
    .auth-content { display: flex; align-items: center; justify-content: center; padding: 3rem clamp(1.5rem, 5vw, 5rem); background:
        radial-gradient(ellipse at 0% 0%, color-mix(in oklch, var(--primary) 15%, transparent), transparent 55%),
        radial-gradient(ellipse at 100% 100%, color-mix(in oklch, var(--secondary) 65%, transparent), transparent 60%); }
    .auth-form-wrap { width: 100%; max-width: 23rem; }
    .auth-heading { margin-bottom: 1.25rem; }
    .auth-mark { width: 2.5rem; height: .25rem; background: var(--primary); margin-bottom: 1rem; }
    h1 { margin: 0 0 .5rem; font-size: 1.25rem; line-height: 1.15; font-weight: 600; letter-spacing: -.045em; }
    .auth-heading p { color: color-mix(in oklch, var(--foreground) 75%, transparent); font-size: .875rem; line-height: 1.6; }
    .auth-legal { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-top: 1.25rem; font-size: .75rem; color: color-mix(in oklch, var(--foreground) 75%, transparent); }
    .auth-page :global(a:hover) { text-decoration: underline; text-underline-offset: 4px; }
    .auth-page :global(a:focus-visible) { outline: 2px solid var(--ring); outline-offset: 4px; }
    .auth-content :global(input) { background: color-mix(in oklch, var(--background) 80%, transparent); box-shadow: none; }
    .auth-content :global(button[type="submit"]) { box-shadow: none; }
    @media (min-width: 1600px) { .auth-world { min-height: 100svh; } }
    @media (max-width: 850px) {
        .auth-page { grid-template-columns: 1fr; }
        .auth-world { min-height: 12rem; padding: 1.5rem; }
        .auth-photo { object-position: center 54%; }
        .auth-brand { font-size: 1.5rem; }
        .auth-brand :global(svg) { width: 2.25rem; height: 2.25rem; }
        .auth-story { padding-top: 1.5rem; }
        .auth-motto { font-size: 1.25rem; margin-bottom: 0; }
        .auth-motto br { display: none; }
        .auth-caption { display: none; }
        .auth-content { padding: 2rem 1.5rem; }
        .auth-heading { margin-bottom: 1rem; }
        .auth-mark { display: none; }
    }
</style>
