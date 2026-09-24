import type { Permission } from "@/lib/auth/permissions";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "./routes";

export interface NavItem {
    key: string;
    /** Resolves the label out of the active dictionary. */
    label: (t: Dictionary) => string;
    href: (locale: Locale) => string;
    /** The row's 14px glyph, exported from the sidebar in 873:49160. */
    iconSrc: string;
    /**
     * Set when the export is the bare glyph rather than the 14px frame: its
     * size, drawn centred in the frame as the artboard insets it.
     */
    iconGlyph?: { width: number; height: number };
    /** Item is hidden unless the role holds this permission. */
    permission: Permission;
}

/**
 * The sidebar of all three roles, in one flat list.
 *
 * The nav is FLAT. The News Feed artboard (873:49160) shows seven rows ending
 * with "Admin Panel" (now labelled Users), which is the admin-only Users area:
 * Broker and Top Broker lack `users:read`, so `visibleNavItems` drops that row
 * for them. There is no per-role nav array to keep in sync.
 *
 * Listings deliberately has no entry here. It is absent from the sidebar in the
 * prototype, and its artboard (886:15740) sits at the head of the Floor Plan
 * row on the canvas — so it is most likely a Floor Plan sub-view rather than a
 * destination of its own. The route still resolves; only the nav link is gone,
 * pending confirmation.
 */
export const NAV_ITEMS: readonly NavItem[] = [
    {
        key: "news-feed",
        label: (t) => t.nav.newsFeed,
        href: routes.newsFeed,
        iconSrc: "/images/layout/nav-news-feed.svg",
        permission: "news:read",
    },
    {
        key: "clients",
        label: (t) => t.nav.clients,
        href: routes.clients,
        iconSrc: "/images/layout/nav-clients.svg",
        permission: "clients:read",
    },
    {
        key: "broker-role",
        label: (t) => t.nav.brokerRole,
        href: routes.brokerRole,
        iconSrc: "/images/layout/nav-broker-role.svg",
        // Interface, Essential/Key: inset 14.58% in its frame, then -5.04%.
        iconGlyph: { width: 10.9173, height: 10.9165 },
        permission: "brokers:read",
    },
    {
        key: "finance",
        label: (t) => t.nav.finance,
        href: routes.finance,
        iconSrc: "/images/layout/nav-finance.svg",
        permission: "finance:read",
    },
    {
        key: "projects",
        label: (t) => t.nav.projects,
        href: routes.projects,
        iconSrc: "/images/layout/nav-projects.svg",
        // building-modern-4: insets that net out centred in the 14px frame.
        iconGlyph: { width: 12.6667, height: 11.4992 },
        permission: "projects:read",
    },
    {
        key: "floor-plan",
        label: (t) => t.nav.floorPlan,
        href: routes.floorPlan,
        iconSrc: "/images/layout/nav-floor-plan.svg",
        permission: "floorplan:read",
    },
    {
        key: "users",
        label: (t) => t.nav.users,
        href: routes.adminUsers,
        iconSrc: "/images/layout/nav-admin-panel.svg",
        permission: "users:read",
    },
];

/** Drops the rows the given role may not see. */
export function visibleNavItems(
    items: readonly NavItem[],
    can: (permission: Permission) => boolean,
): NavItem[] {
    return items.filter((item) => can(item.permission));
}
