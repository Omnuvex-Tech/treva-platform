import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { routes } from "@/config/routes";

/** One step in a breadcrumb trail. The last crumb is the current page, so it
 *  carries no `href` — it is rendered as plain text, not a link. */
export interface Crumb {
    label: string;
    href?: string;
}

/**
 * What the header shows on the left.
 *
 * A union rather than an optional field because the artboards are exclusive:
 * list screens draw a Title + Subtitle block (873:48482), the article detail
 * draws a Breadcrumbs row instead (873:51699). Nothing in the file shows both.
 */
export type PageHeading =
    | { kind: "title"; title: string; subtitle: string }
    | { kind: "breadcrumbs"; trail: Crumb[] };

/**
 * The header's left-hand content, keyed by the path with the locale prefix
 * stripped.
 *
 * Derived from the route rather than set by each page: the header lives in the
 * dashboard layout, above `children`, so a page cannot render into it without
 * either a client-side store or a parallel route. Every screen in the design
 * has exactly one fixed heading, so a lookup is both simpler and one less
 * client boundary. If a screen ever needs a dynamic heading (an article title
 * in the trail, say), give that page a parallel `@header` slot rather than
 * making this map stateful.
 */
const PAGE_META: Record<string, (t: Dictionary) => PageHeading> = {
    "/news-feed": (t) => ({ kind: "title", title: t.news.title, subtitle: t.news.subtitle }),
    "/news-feed/new": (t) => ({ kind: "title", title: t.news.editor.createTitle, subtitle: "" }),
    "/clients": (t) => ({ kind: "title", title: t.clients.title, subtitle: t.clients.subtitle }),
    "/broker-role": (t) => ({
        kind: "title",
        title: t.brokerRole.title,
        subtitle: t.brokerRole.subtitle,
    }),
    "/finance": (t) => ({ kind: "title", title: t.finance.title, subtitle: t.finance.subtitle }),
    "/projects": (t) => ({ kind: "title", title: t.projects.title, subtitle: t.projects.subtitle }),
    "/floor-plan": (t) => ({
        kind: "title",
        title: t.floorPlan.title,
        subtitle: t.floorPlan.subtitle,
    }),
    "/admin/users": (t) => ({ kind: "title", title: t.users.title, subtitle: t.users.subtitle }),
    "/admin/listings": (t) => ({
        kind: "title",
        title: t.listings.title,
        subtitle: t.listings.subtitle,
    }),
};

/** Strips a leading `/en`, `/az` or `/ru` from a pathname. */
export function stripLocale(pathname: string): string {
    const [, first = ""] = pathname.split("/");

    if ((LOCALES as readonly string[]).includes(first)) {
        const rest = pathname.slice(first.length + 1);
        return rest || "/";
    }

    return pathname;
}

export function getPageHeading(pathname: string, t: Dictionary, locale: Locale): PageHeading {
    const path = stripLocale(pathname);

    // Article routes carry an id, so they cannot be static keys in the map.
    if (/^\/news-feed\/[^/]+\/edit$/.test(path)) {
        return { kind: "title", title: t.news.editor.editTitle, subtitle: "" };
    }
    if (path !== "/news-feed/new" && /^\/news-feed\/[^/]+$/.test(path)) {
        return {
            kind: "breadcrumbs",
            trail: [
                { label: t.news.title, href: routes.newsFeed(locale) },
                { label: t.common.detail },
            ],
        };
    }

    // A client's own screen swaps the title block for a trail, exactly as the
    // article detail does (873:49409).
    if (/^\/clients\/[^/]+$/.test(path)) {
        return {
            kind: "breadcrumbs",
            trail: [
                { label: t.clients.title, href: routes.clients(locale) },
                { label: t.common.detail },
            ],
        };
    }

    // The file editor swaps the section title for a trail, exactly as the
    // article detail does — 873:52026 draws "Broker Role" then "Edit".
    if (/^\/broker-role\/[^/]+\/edit$/.test(path)) {
        return {
            kind: "breadcrumbs",
            trail: [
                { label: t.brokerRole.title, href: routes.brokerRole(locale) },
                { label: t.common.edit },
            ],
        };
    }

    // Longest-prefix match so a future nested route still shows its section
    // header instead of falling through to the app name.
    const match = Object.keys(PAGE_META)
        .filter((key) => path === key || path.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0];

    return match ? PAGE_META[match]!(t) : { kind: "title", title: t.common.loading, subtitle: "" };
}
