import {
    Building2,
    LayoutGrid,
    Newspaper,
    Settings2,
    Users,
    Wallet,
    UserRoundCog,
    ListChecks,
    Languages,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Permission } from "@/lib/auth/permissions";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "./routes";

export interface NavItem {
    key: string;
    /** Resolves the label out of the active dictionary. */
    label: (t: Dictionary) => string;
    href: (locale: Locale) => string;
    icon: LucideIcon;
    /** Item is hidden unless the role holds this permission. */
    permission: Permission;
    children?: NavItem[];
}

/**
 * The sidebar of all three roles, in one list.
 *
 * Compare the Figma sections and the only structural difference is the trailing
 * Admin Panel group — Broker and Top Broker simply lack `admin:access`, so the
 * filter in `visibleNavItems` drops it for them. There is no per-role nav array
 * to keep in sync.
 */
export const NAV_ITEMS: readonly NavItem[] = [
    {
        key: "news-feed",
        label: (t) => t.nav.newsFeed,
        href: routes.newsFeed,
        icon: Newspaper,
        permission: "news:read",
    },
    {
        key: "clients",
        label: (t) => t.nav.clients,
        href: routes.clients,
        icon: Users,
        permission: "clients:read",
    },
    {
        key: "broker-role",
        label: (t) => t.nav.brokerRole,
        href: routes.brokerRole,
        icon: UserRoundCog,
        permission: "brokers:read",
    },
    {
        key: "finance",
        label: (t) => t.nav.finance,
        href: routes.finance,
        icon: Wallet,
        permission: "finance:read",
    },
    {
        key: "projects",
        label: (t) => t.nav.projects,
        href: routes.projects,
        icon: Building2,
        permission: "projects:read",
    },
    {
        key: "floor-plan",
        label: (t) => t.nav.floorPlan,
        href: routes.floorPlan,
        icon: LayoutGrid,
        permission: "floorplan:read",
    },
    {
        key: "admin",
        label: (t) => t.nav.adminPanel,
        href: routes.adminUsers,
        icon: Settings2,
        permission: "admin:access",
        children: [
            {
                key: "admin-users",
                label: (t) => t.nav.users,
                href: routes.adminUsers,
                icon: Users,
                permission: "users:read",
            },
            {
                key: "admin-listings",
                label: (t) => t.nav.listings,
                href: routes.adminListings,
                icon: ListChecks,
                permission: "listings:read",
            },
            {
                key: "admin-language",
                label: (t) => t.nav.language,
                href: routes.adminLanguage,
                icon: Languages,
                permission: "language:manage",
            },
        ],
    },
];

/** Filters the tree down to what the given role may see. */
export function visibleNavItems(
    items: readonly NavItem[],
    can: (permission: Permission) => boolean,
): NavItem[] {
    return items
        .filter((item) => can(item.permission))
        .map((item) =>
            item.children ? { ...item, children: visibleNavItems(item.children, can) } : item,
        );
}
