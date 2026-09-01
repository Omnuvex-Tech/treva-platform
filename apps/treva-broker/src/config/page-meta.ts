import type { Dictionary } from "@/lib/i18n/types";
import { LOCALES } from "@/lib/i18n/config";

export interface PageMeta {
    title: string;
    subtitle: string;
}

/**
 * Title + subtitle for the app header, keyed by the path with the locale prefix
 * stripped.
 *
 * Derived from the route rather than set by each page: the header lives in the
 * dashboard layout, above `children`, so a page cannot render into it without
 * either a client-side store or a parallel route. Every screen in the design
 * has exactly one fixed title/subtitle pair, so a lookup is both simpler and
 * one less client boundary. If a screen ever needs a dynamic title (a client
 * name, say), give that page a parallel `@header` slot rather than making this
 * map stateful.
 */
const PAGE_META: Record<string, (t: Dictionary) => PageMeta> = {
    "/news-feed": (t) => ({ title: t.news.title, subtitle: t.news.subtitle }),
    "/clients": (t) => ({ title: t.clients.title, subtitle: t.clients.subtitle }),
    "/broker-role": (t) => ({ title: t.brokerRole.title, subtitle: t.brokerRole.subtitle }),
    "/finance": (t) => ({ title: t.finance.title, subtitle: t.finance.subtitle }),
    "/projects": (t) => ({ title: t.projects.title, subtitle: t.projects.subtitle }),
    "/floor-plan": (t) => ({ title: t.floorPlan.title, subtitle: t.floorPlan.subtitle }),
    "/admin/users": (t) => ({ title: t.users.title, subtitle: t.users.subtitle }),
    "/admin/listings": (t) => ({ title: t.listings.title, subtitle: t.listings.subtitle }),
    "/admin/language": (t) => ({
        title: t.languageAdmin.title,
        subtitle: t.languageAdmin.subtitle,
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

export function getPageMeta(pathname: string, t: Dictionary): PageMeta {
    const path = stripLocale(pathname);

    // Longest-prefix match so a future `/clients/[id]` still shows the Clients
    // header instead of falling through to the app name.
    const match = Object.keys(PAGE_META)
        .filter((key) => path === key || path.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0];

    return match
        ? PAGE_META[match]!(t)
        : { title: t.common.loading, subtitle: "" };
}
