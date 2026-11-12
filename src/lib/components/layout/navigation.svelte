<script>
    import { onMount } from "svelte";
    import { ArrowRight, LogIn, LogOut, Settings2, UserRound, UserRoundPlus } from "lucide-svelte";
    import GlobeLogo from "$lib/assets/logos/VX78WS01.svelte";
    import AccountMenu from "./account-menu.svelte";
    import { getAccountMenuItems } from "./account-menu.js";
    import { isRouteActive } from "./site-chrome.js";

    let {
        auth = { isAuthenticated: false, isOnboarded: false, roles: [], claims: null },
        viewer = { isAuthenticated: false, name: null, avatar: null, username: null },
        variant = "app",
        pathname = "/",
        class: className = ""
    } = $props();

    const marketingLinks = [
        { number: "01", label: "Postcards", href: "/postcards" },
        { number: "02", label: "Programs", href: "/programs" },
        { number: "03", label: "Community", href: "/community" },
        { number: "04", label: "About", href: "/about" }
    ];

    const appLinks = [
        { label: "Postcards", href: "/postcards" },
        { label: "Programs", href: "/programs" },
        { label: "Scholarships", href: "/scholarships"},
        { label: "Community", href: "/community" }
    ];

    const menuIcons = {
        Profile: UserRound,
        Settings: Settings2,
        Logout: LogOut,
        Login: LogIn,
        "Sign Up": UserRoundPlus
    };

    let mobileNavOpen = $state(false);
    let mobileNavButton = $state();
    const isAuthenticated = $derived(Boolean(auth?.isAuthenticated));
    const links = $derived(variant === "marketing" ? marketingLinks : appLinks);
    const accountItems = $derived(getAccountMenuItems(isAuthenticated));

    function closeMobileNav({ restoreFocus = false } = {}) {
        mobileNavOpen = false;
        if (restoreFocus) requestAnimationFrame(() => mobileNavButton?.focus());
    }

    function handleKeydown(event) {
        if (event.key === "Escape" && mobileNavOpen) {
            event.preventDefault();
            closeMobileNav({ restoreFocus: true });
        }
    }

    onMount(() => {
        const desktopQuery = window.matchMedia("(min-width: 64.001rem)");
        const handleDesktopChange = (event) => {
            if (event.matches) closeMobileNav();
        };

        desktopQuery.addEventListener("change", handleDesktopChange);
        return () => desktopQuery.removeEventListener("change", handleDesktopChange);
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class={`site-header site-header--${variant} ${className}`}>
    <div class="header-inner">
        <a class="brand" href="/" aria-label="RomeWithMe — Grow Roots in New Places, home">
            <span class="brand-icon"><GlobeLogo class="brand-mark" fill="currentColor" /></span>
            <span class="brand-copy brand-lockup-tight">
                <strong>RomeWithMe</strong>
                <small>Grow Roots in New Places</small>
            </span>
        </a>

        <nav class="desktop-nav" aria-label={variant === "marketing" ? "Site navigation" : "Application navigation"}>
            {#each links as item}
                <a href={item.href} aria-current={isRouteActive(pathname, item.href) ? "page" : undefined}>
                    {#if item.number}<small>{item.number}</small>{/if}
                    <span>{item.label}</span>
                </a>
            {/each}
        </nav>

        <div class="desktop-actions">
            {#if isAuthenticated}
                <AccountMenu {viewer} variant="dark" />
            {:else if variant === "marketing"}
                <a class="header-cta" href="/auth/signup" data-analytics-event="signup_clicked">
                    <span>Join the community</span>
                    <ArrowRight aria-hidden="true" />
                </a>
            {:else}
                <a class="login-link" href="/auth/login">Log in</a>
                <a class="header-cta compact" href="/auth/signup" data-analytics-event="signup_clicked">Sign up</a>
            {/if}
        </div>

        <div class:open={mobileNavOpen} class="mobile-nav">
            <button
                bind:this={mobileNavButton}
                type="button"
                aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileNavOpen}
                aria-controls="global-mobile-navigation"
                onclick={() => (mobileNavOpen = !mobileNavOpen)}
            >
                <span>Menu</span>
                <span class="menu-icon" aria-hidden="true"><i></i><i></i></span>
            </button>

            <nav
                id="global-mobile-navigation"
                aria-label={variant === "marketing" ? "Mobile site navigation" : "Mobile application navigation"}
                aria-hidden={!mobileNavOpen}
            >
                {#each links as item}
                    <a
                        href={item.href}
                        aria-current={isRouteActive(pathname, item.href) ? "page" : undefined}
                        onclick={() => closeMobileNav()}
                    >
                        {#if item.number}<small>{item.number}</small>{/if}
                        <span>{item.label}</span>
                        <ArrowRight aria-hidden="true" />
                    </a>
                {/each}

                <div class="mobile-account" aria-label="Account navigation">
                    {#if variant === "marketing" && !isAuthenticated}
                        <a class="mobile-nav-cta" href="/auth/signup" data-analytics-event="signup_clicked" onclick={() => closeMobileNav()}>
                            <small>05</small>
                            <span>Join RomeWithMe</span>
                            <ArrowRight aria-hidden="true" />
                        </a>
                        <a class="mobile-account-link" href="/auth/login" onclick={() => closeMobileNav()}>
                            <LogIn aria-hidden="true" />
                            <span>Log in</span>
                        </a>
                    {:else}
                        {#each accountItems as item}
                            {@const Icon = menuIcons[item.label]}
                            {#if item.action === "logout"}
                                <form method="POST" action="/auth/logout">
                                    <button type="submit">
                                        <Icon aria-hidden="true" />
                                        <span>{item.label}</span>
                                    </button>
                                </form>
                            {:else if item.href}
                                <a class:item-cta={item.label === "Sign Up"} href={item.href} data-analytics-event={item.label === "Sign Up" ? "signup_clicked" : undefined} data-analytics-location="mobile-navigation" onclick={() => closeMobileNav()}>
                                    <Icon aria-hidden="true" />
                                    <span>{item.label}</span>
                                </a>
                            {/if}
                        {/each}
                    {/if}
                </div>
            </nav>
        </div>
    </div>
</div>

<style>
    .site-header {
        --header-paper: #f4efe6;
        --header-paper-bright: #fffaf1;
        --header-ink: #19212a;
        --header-orange: #d95d32;
        --header-orange-action: #b94722;
        --header-orange-on-dark: #e66b42;
        --header-charcoal: #1d2226;
        --header-shell: var(--app-shell-max);
        --header-gutter: var(--app-x-gutter);
        --motion-fast: 180ms;
        --motion-medium: 280ms;
        --motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
        border-bottom: 3px solid var(--header-orange);
        background: var(--header-charcoal);
        color: var(--header-paper-bright);
    }

    .site-header--marketing {
        --header-shell: 96rem;
    }

    .header-inner {
        position: relative;
        display: grid;
        min-height: 4.75rem;
        max-width: var(--header-shell);
        margin: 0 auto;
        padding: 0 var(--header-gutter);
        align-items: center;
        grid-template-columns: auto minmax(20rem, 1fr) auto;
        gap: clamp(1.5rem, 3vw, 3.5rem);
    }

    .site-header--marketing .header-inner {
        min-height: 5.75rem;
        grid-template-columns: auto minmax(26rem, 1fr) auto;
        gap: clamp(2rem, 4vw, 5rem);
    }

    .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        color: var(--header-paper-bright);
        text-decoration: none;
    }

    .brand-icon {
        display: block;
        width: 4rem;
        height: 4rem;
        color: var(--header-orange-on-dark);
        flex: 0 0 auto;
        line-height: 0;
    }

    .site-header--marketing .brand-icon {
        width: 5rem;
        height: 5rem;
    }

    .brand-icon :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }

    .brand-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        white-space: nowrap;
    }

    .brand-copy strong {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.15;
    }

    .site-header--marketing .brand-copy strong {
        font-size: 1.5rem;
    }

    .brand-copy small {
        color: color-mix(in srgb, var(--header-paper) 78%, transparent);
        font-size: 0.78rem;
        font-weight: 400;
        line-height: 1.25;
    }

    .site-header--marketing .brand-copy small {
        font-size: 0.875rem;
    }

    .desktop-nav {
        display: flex;
        align-items: center;
        justify-self: center;
        gap: clamp(1.25rem, 2.4vw, 2.5rem);
    }

    .desktop-nav a {
        position: relative;
        display: grid;
        padding: 0.75rem 0;
        color: var(--header-paper-bright);
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1;
        text-decoration: none;
        transition: color var(--motion-fast) var(--motion-ease);
    }

    .desktop-nav a::after {
        position: absolute;
        right: 0;
        bottom: 0.3rem;
        left: 0;
        height: 2px;
        background: var(--header-orange-on-dark);
        content: "";
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--motion-fast) var(--motion-ease);
    }

    .desktop-nav small {
        margin-bottom: 0.3rem;
        color: var(--header-orange-on-dark);
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.12em;
    }

    .desktop-nav a:hover,
    .desktop-nav a:focus-visible,
    .desktop-nav a[aria-current="page"] {
        color: var(--header-orange-on-dark);
    }

    .desktop-nav a:hover::after,
    .desktop-nav a:focus-visible::after,
    .desktop-nav a[aria-current="page"]::after {
        transform: scaleX(1);
    }

    .desktop-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.8rem;
    }

    .header-cta,
    .login-link {
        display: inline-flex;
        min-height: 3.1rem;
        padding: 0.75rem 1rem;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: var(--header-paper-bright);
        font-size: 0.9rem;
        font-weight: 700;
        text-decoration: none;
        transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease);
    }

    .header-cta {
        background: var(--header-orange-action);
    }

    .header-cta:hover,
    .header-cta:focus-visible {
        background: var(--header-paper-bright);
        color: var(--header-ink);
    }

    .header-cta.compact {
        min-height: 2.75rem;
        padding: 0.65rem 0.9rem;
    }

    .login-link {
        min-height: 2.75rem;
        padding-right: 0.35rem;
        padding-left: 0.35rem;
    }

    .login-link:hover,
    .login-link:focus-visible {
        color: var(--header-orange-on-dark);
    }

    .header-cta :global(svg) {
        width: 1.1rem;
        height: 1.1rem;
        flex: 0 0 auto;
    }

    .mobile-nav {
        display: none;
    }

    .mobile-nav > button {
        display: flex;
        min-height: 3.25rem;
        padding: 0 0.9rem;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid color-mix(in srgb, var(--header-paper) 35%, transparent);
        background: transparent;
        color: var(--header-paper-bright);
        cursor: pointer;
        font: inherit;
        font-size: 0.86rem;
        font-weight: 700;
    }

    .menu-icon {
        position: relative;
        display: block;
        width: 1.2rem;
        height: 0.9rem;
    }

    .menu-icon i {
        position: absolute;
        top: calc(50% - 1px);
        right: 0;
        left: 0;
        height: 2px;
        background: currentColor;
        transition: transform var(--motion-medium) var(--motion-ease);
    }

    .menu-icon i:first-child { transform: translateY(-0.24rem); }
    .menu-icon i:last-child { transform: translateY(0.24rem); }
    .mobile-nav.open .menu-icon i:first-child { transform: rotate(45deg); }
    .mobile-nav.open .menu-icon i:last-child { transform: rotate(-45deg); }

    .mobile-nav nav {
        position: absolute;
        top: 100%;
        right: 0;
        left: 0;
        display: grid;
        max-height: calc(100dvh - 5rem);
        padding: 0 1.25rem;
        overflow: hidden auto;
        overscroll-behavior: contain;
        border-top: 1px solid color-mix(in srgb, var(--header-paper) 18%, transparent);
        border-bottom: 3px solid var(--header-orange);
        background: var(--header-charcoal);
        opacity: 0;
        pointer-events: none;
        transform: translateY(-0.75rem);
        visibility: hidden;
        transition:
            opacity var(--motion-medium) var(--motion-ease),
            transform var(--motion-medium) var(--motion-ease),
            visibility 0s linear var(--motion-medium),
            padding var(--motion-medium) var(--motion-ease);
    }

    .mobile-nav.open nav {
        padding-top: 0.5rem;
        padding-bottom: 1.25rem;
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
        visibility: visible;
        transition-delay: 0s;
    }

    .mobile-nav nav > a,
    .mobile-account a,
    .mobile-account button {
        display: grid;
        width: 100%;
        min-height: 4.1rem;
        padding: 0;
        align-items: center;
        grid-template-columns: 2.4rem 1fr auto;
        border: 0;
        border-bottom: 1px solid color-mix(in srgb, var(--header-paper) 20%, transparent);
        background: transparent;
        color: var(--header-paper-bright);
        cursor: pointer;
        font: inherit;
        font-size: 1.08rem;
        font-weight: 700;
        text-align: left;
        text-decoration: none;
    }

    .site-header--app .mobile-nav nav > a:not([aria-current="page"]) small {
        visibility: hidden;
    }

    .site-header--app .mobile-nav nav > a[aria-current="page"] small::after {
        color: var(--header-orange-on-dark);
        content: "•";
        visibility: visible;
    }

    .mobile-nav nav small {
        color: var(--header-orange-on-dark);
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.12em;
    }

    .mobile-nav nav :global(svg) {
        width: 1.1rem;
        height: 1.1rem;
    }

    .mobile-nav nav > a:hover,
    .mobile-nav nav > a:focus-visible,
    .mobile-nav nav > a[aria-current="page"],
    .mobile-account a:hover,
    .mobile-account a:focus-visible,
    .mobile-account button:hover,
    .mobile-account button:focus-visible {
        color: var(--header-orange-on-dark);
    }

    .mobile-nav-cta,
    .mobile-account .item-cta {
        margin-top: 0.85rem;
        padding: 0 1rem !important;
        border: 0 !important;
        background: var(--header-orange-action) !important;
        color: var(--header-paper-bright) !important;
    }

    .mobile-account-link {
        margin-top: 0.25rem;
    }

    .mobile-account form {
        margin: 0;
    }

    .site-header a:focus-visible,
    .site-header button:focus-visible {
        outline: 3px solid var(--header-orange-on-dark);
        outline-offset: 3px;
    }

    @media (max-width: 76rem) {
        .header-inner,
        .site-header--marketing .header-inner {
            padding: 0 var(--header-gutter);
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 1.5rem;
        }

        .desktop-nav {
            gap: clamp(1rem, 2vw, 1.5rem);
        }
    }

    @media (max-width: 64rem) {
        .header-inner,
        .site-header--marketing .header-inner {
            min-height: 5.25rem;
            padding: 0 var(--header-gutter);
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 1rem;
        }

        .brand-icon,
        .site-header--marketing .brand-icon {
            width: 4.25rem;
            height: 4.25rem;
        }

        .brand-copy strong,
        .site-header--marketing .brand-copy strong {
            font-size: 1.25rem;
        }

        .brand-copy small,
        .site-header--marketing .brand-copy small {
            font-size: 0.8125rem;
        }

        .desktop-nav,
        .desktop-actions {
            display: none;
        }

        .mobile-nav {
            display: block;
        }
    }

    @media (max-width: 36rem) {
        .header-inner,
        .site-header--marketing .header-inner {
            gap: 0.5rem;
            padding: 0 var(--header-gutter);
        }

        .brand-icon,
        .site-header--marketing .brand-icon {
            width: 3rem;
            height: 3rem;
        }

        .brand-copy strong,
        .site-header--marketing .brand-copy strong {
            font-size: 1.05rem;
        }

        .brand-copy small {
            display: none;
        }

        .mobile-nav > button {
            width: 3.25rem;
            padding: 0;
            justify-content: center;
        }

        .mobile-nav > button > span:first-child {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .site-header *,
        .site-header *::before,
        .site-header *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-delay: 0s !important;
            transition-duration: 0.01ms !important;
        }
    }
</style>
