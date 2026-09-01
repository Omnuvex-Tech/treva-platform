import type { Locale } from "@/lib/i18n/config";

/**
 * Single source of truth for every path in the app.
 *
 * Routes are locale-prefixed (`/en/news-feed`) and role-agnostic — all three
 * roles browse the same URLs, which is why there is no `/admin` variant of
 * News Feed or Clients here. Only the genuinely admin-only screens sit under
 * `/admin`.
 */
export const routes = {
    login: (locale: Locale) => `/${locale}/login`,
    forgotPassword: (locale: Locale) => `/${locale}/forgot-password`,
    resetPassword: (locale: Locale) => `/${locale}/reset-password`,

    newsFeed: (locale: Locale) => `/${locale}/news-feed`,
    clients: (locale: Locale) => `/${locale}/clients`,
    brokerRole: (locale: Locale) => `/${locale}/broker-role`,
    finance: (locale: Locale) => `/${locale}/finance`,
    projects: (locale: Locale) => `/${locale}/projects`,
    floorPlan: (locale: Locale) => `/${locale}/floor-plan`,

    adminUsers: (locale: Locale) => `/${locale}/admin/users`,
    adminListings: (locale: Locale) => `/${locale}/admin/listings`,
    adminLanguage: (locale: Locale) => `/${locale}/admin/language`,
} as const;

/** Where a signed-in user lands — News Feed is the first sidebar item in every role. */
export const HOME_ROUTE = routes.newsFeed;

/** Paths that must stay reachable without a session. */
export const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"] as const;

export function isPublicPath(pathnameWithoutLocale: string): boolean {
    return PUBLIC_PATHS.some(
        (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`),
    );
}
