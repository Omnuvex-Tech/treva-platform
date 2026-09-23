import type { Locale } from "@/lib/i18n/config";

/**
 * Single source of truth for every path in the app.
 *
 * Routes are locale-prefixed (`/en/news-feed`) and role-agnostic — all three
 * roles browse the same URLs, which is why there is no `/admin` variant of
 * News Feed or Clients here. Users sits at `/users`, flat like every other
 * section; only the agency and listings screens still sit under `/admin`.
 */
export const routes = {
    login: (locale: Locale) => `/${locale}/login`,
    /** The second action on the Welcome artboard (873:59617). */
    register: (locale: Locale) => `/${locale}/register`,
    forgotPassword: (locale: Locale) => `/${locale}/forgot-password`,
    resetPassword: (locale: Locale) => `/${locale}/reset-password`,

    newsFeed: (locale: Locale) => `/${locale}/news-feed`,
    newsNew: (locale: Locale) => `/${locale}/news-feed/new`,
    newsDetail: (locale: Locale, id: string) => `/${locale}/news-feed/${id}`,
    newsEdit: (locale: Locale, id: string) => `/${locale}/news-feed/${id}/edit`,
    clients: (locale: Locale) => `/${locale}/clients`,
    clientDetail: (locale: Locale, id: string) => `/${locale}/clients/${id}`,
    clientEdit: (locale: Locale, id: string) => `/${locale}/clients/${id}/edit`,
    brokerRole: (locale: Locale) => `/${locale}/broker-role`,
    brokerRoleEdit: (locale: Locale, id: string) => `/${locale}/broker-role/${id}/edit`,
    finance: (locale: Locale) => `/${locale}/finance`,
    projects: (locale: Locale) => `/${locale}/projects`,
    /** The editor with nothing loaded — "Add new projects" (873:51091). */
    projectNew: (locale: Locale) => `/${locale}/projects/new`,
    /** A project's own screen (1173:16211). */
    projectDetail: (locale: Locale, id: string) => `/${locale}/projects/${id}`,
    projectEdit: (locale: Locale, id: string) => `/${locale}/projects/${id}/edit`,
    /** Listings; with a project, only that project's buildings. */
    floorPlan: (locale: Locale, projectId?: string) =>
        projectId
            ? `/${locale}/magazine?project=${encodeURIComponent(projectId)}`
            : `/${locale}/magazine`,
    floorPlanBuilding: (locale: Locale, id: string) => `/${locale}/magazine/${id}`,

    adminUsers: (locale: Locale) => `/${locale}/users`,
    adminUserNew: (locale: Locale) => `/${locale}/users/new`,
    adminUserEdit: (locale: Locale, id: string) => `/${locale}/users/${id}/edit`,
    /**
     * The Real Estate Agencies tab is a tab, not a URL — but its create and
     * edit screens are their own pages, exactly as the agent form is, so they
     * sit beside Users rather than inside it.
     */
    adminAgencyNew: (locale: Locale) => `/${locale}/admin/agencies/new`,
    adminAgencyEdit: (locale: Locale, id: string) => `/${locale}/admin/agencies/${id}/edit`,
    /**
     * The signed-in account's own card (873:48750). It lives under Users
     * because that is the section the artboard highlights in the rail and the
     * heading it keeps in the header.
     */
    adminUserProfile: (locale: Locale) => `/${locale}/users/profile`,
    adminListings: (locale: Locale) => `/${locale}/admin/listings`,
} as const;

/** Where a signed-in user lands — News Feed is the first sidebar item in every role. */
export const HOME_ROUTE = routes.newsFeed;

/** Paths that must stay reachable without a session. */
export const PUBLIC_PATHS = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
] as const;

export function isPublicPath(pathnameWithoutLocale: string): boolean {
    return PUBLIC_PATHS.some(
        (path) => pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`),
    );
}
