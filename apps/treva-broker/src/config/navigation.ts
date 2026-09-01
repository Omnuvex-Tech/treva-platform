import {
    Building01Icon,
    Coins01Icon,
    FloorPlanIcon,
    Key01Icon,
    News01Icon,
    UserGroup03Icon,
    UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type { Permission } from "@/lib/auth/permissions";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "./routes";

export interface NavItem {
    key: string;
    /** Resolves the label out of the active dictionary. */
    label: (t: Dictionary) => string;
    href: (locale: Locale) => string;
    icon: IconSvgElement;
    /** Item is hidden unless the role holds this permission. */
    permission: Permission;
}

/**
 * The sidebar of all three roles, in one flat list.
 *
 * The nav is FLAT — there is no "Admin Panel" group. The prototype shows seven
 * items ending with Users, which an admin simply has and the other roles do
 * not: Broker and Top Broker lack `users:read`, so `visibleNavItems` drops that
 * row for them. There is no per-role nav array to keep in sync.
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
        icon: News01Icon,
        permission: "news:read",
    },
    {
        key: "clients",
        label: (t) => t.nav.clients,
        href: routes.clients,
        icon: UserMultiple02Icon,
        permission: "clients:read",
    },
    {
        key: "broker-role",
        label: (t) => t.nav.brokerRole,
        href: routes.brokerRole,
        icon: Key01Icon,
        permission: "brokers:read",
    },
    {
        key: "finance",
        label: (t) => t.nav.finance,
        href: routes.finance,
        icon: Coins01Icon,
        permission: "finance:read",
    },
    {
        key: "projects",
        label: (t) => t.nav.projects,
        href: routes.projects,
        icon: Building01Icon,
        permission: "projects:read",
    },
    {
        key: "floor-plan",
        label: (t) => t.nav.floorPlan,
        href: routes.floorPlan,
        icon: FloorPlanIcon,
        permission: "floorplan:read",
    },
    {
        key: "users",
        label: (t) => t.nav.users,
        href: routes.adminUsers,
        icon: UserGroup03Icon,
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
