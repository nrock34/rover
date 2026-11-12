<script>
    import ResilientImage from "$lib/components/shared/ResilientImage.svelte";

    let {
        variant = "default",
        kicker,
        title,
        description,
        image,
        fallbackImage,
        imageAlt,
        imagePosition = "center",
        contentId = undefined,
        search = undefined,
        actions = undefined,
        children
    } = $props();

    const isShowcase = $derived(["programs", "scholarships", "showcase"].includes(variant));
</script>

<div class:directory-showcase={isShowcase} class="directory-page min-h-screen bg-muted/20">
    <section class="directory-hero relative isolate overflow-hidden border-b border-border bg-muted">
        <ResilientImage
            class="directory-hero-image absolute inset-0 -z-20 h-full w-full object-cover"
            style={`object-position: ${imagePosition};`}
            src={image}
            fallbackSrc={fallbackImage}
            alt={imageAlt}
            loading="eager"
        />
        <div class="directory-hero-overlay absolute inset-0 -z-10"></div>

        <div class="directory-hero-shell app-shell">
            <div class="directory-hero-copy max-w-2xl">
                {#if kicker}<p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</p>{/if}
                <h1 class={`${kicker ? "mt-3" : ""} directory-title font-display font-semibold tracking-tight text-foreground`}>{title}</h1>
                <p class="directory-description mt-4 max-w-xl text-base text-foreground/75">{description}</p>
                {#if search}<div class="directory-search mt-6 max-w-xl">{@render search()}</div>{/if}
                {#if actions}<div class="mt-5 flex flex-wrap gap-3">{@render actions()}</div>{/if}
            </div>
        </div>
    </section>

    <div id={contentId} class="directory-content app-shell relative scroll-mt-24 pb-12">
        {@render children()}
    </div>
</div>

<style>
    .directory-hero {
        min-height: 20rem;
    }

    .directory-hero-overlay {
        background: linear-gradient(90deg, color-mix(in srgb, var(--background) 95%, transparent) 0%, color-mix(in srgb, var(--background) 75%, transparent) 52%, color-mix(in srgb, var(--background) 10%, transparent) 100%);
    }

    .directory-hero-shell {
        padding-top: 2.5rem;
        padding-bottom: 3rem;
    }

    .directory-title {
        font-size: clamp(2.25rem, 4vw, 3.5rem);
        line-height: 1.02;
    }

    .directory-description {
        line-height: 1.25;
        font-size: clamp(0.9rem, 1.1vw, 2rem)
    }

    .directory-content {
        margin-top: -1.75rem;
    }

    .directory-showcase {
        --directory-ink: #123e72;
        --directory-paper: #f7f9fc;
        --directory-border: rgb(18 62 114 / 0.12);
        background: linear-gradient(180deg, #f7f9fc 0%, #fbfcfe 32rem, #f8fafc 100%);
    }

    .directory-showcase .directory-hero {
        min-height: 19.1rem;
        border-bottom-color: var(--directory-border);
        background: #dfe7ee;
    }

    .directory-showcase .directory-hero-overlay {
        background:
            linear-gradient(90deg, rgb(247 249 252 / 0.98) 0%, rgb(247 249 252 / 0.9) 31%, rgb(247 249 252 / 0.56) 48%, rgb(247 249 252 / 0.08) 73%),
            linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(18 62 114 / 0.08));
    }

    .directory-showcase .directory-hero-shell {
        padding-top: 1.9rem;
        padding-bottom: 2.6rem;
    }

    .directory-showcase .directory-hero-copy {
        max-width: 35rem;
    }

    .directory-showcase .directory-title {
        max-width: 34rem;
        color: var(--directory-ink);
        font-size: clamp(2.55rem, 3.7vw, 3.35rem);
        line-height: 0.98;
        letter-spacing: -0.035em;
    }

    .directory-showcase .directory-description {
        max-width: 31rem;
        color: rgb(18 62 114 / 0.82);
        font-size: 0.9rem;
        line-height: 1.48;
    }

    .directory-showcase .directory-search {
        max-width: 30.5rem;
        margin-top: 1rem;
    }

    .directory-showcase .directory-content {
        margin-top: -1.8rem;
    }

    @media (max-width: 64rem) {
        .directory-showcase .directory-hero {
            min-height: 20rem;
        }

        .directory-showcase .directory-hero-overlay {
            background: linear-gradient(90deg, rgb(247 249 252 / 0.96) 0%, rgb(247 249 252 / 0.83) 58%, rgb(247 249 252 / 0.28) 100%);
        }
    }

    @media (max-width: 48rem) {
        .directory-hero,
        .directory-showcase .directory-hero {
            min-height: auto;
        }

        .directory-showcase .directory-hero-image {
            opacity: 0.42;
        }

        .directory-showcase .directory-hero-overlay {
            background: linear-gradient(90deg, rgb(247 249 252 / 0.97), rgb(247 249 252 / 0.78));
        }

        .directory-showcase .directory-hero-shell {
            padding-top: 2rem;
            padding-bottom: 3.5rem;
        }

        .directory-showcase .directory-title {
            max-width: 28rem;
            font-size: clamp(2.25rem, 10vw, 3rem);
            line-height: 1;
        }

        .directory-showcase .directory-description {
            font-size: 0.875rem;
        }

        .directory-showcase .directory-content {
            margin-top: -1.5rem;
        }
    }
</style>
