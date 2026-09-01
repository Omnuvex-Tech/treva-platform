"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, visibleNavItems } from "@/config/navigation";
import { stripLocale } from "@/config/page-meta";
import { useSession } from "@/providers/session-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useUiStore } from "@/stores/ui-store";

/**
 * The navigation rail.
 *
 * The rail is pure white and sits against the #fafafa app surface, divided by a
 * single #f0f1f1 rule — both values measured off the artboard render.
 *
 * There are NO separators between the rows: the artboard draws none, and the
 * hairline that used to be here read far heavier than anything in the design.
 * The rule under the header is drawn by the layout across the full width, so
 * this component contributes only the vertical one.
 */
export function Sidebar() {
    const pathname = usePathname();
    const { locale, t } = useI18n();
    const { can } = useSession();
    const collapsed = useUiStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUiStore((state) => state.toggleSidebar);

    // Filtered by permission, not by role — see config/navigation.ts. This is
    // what makes Users appear for admins only, with no per-role nav array.
    const items = visibleNavItems(NAV_ITEMS, can);
    const path = stripLocale(pathname);

    return (
        <aside
            className={cn(
                "relative shrink-0 border-r border-border-rail bg-bg-primary transition-[width] duration-200",
                // 76px collapsed, measured off the collapsed artboard (873:48750),
                // where the rail is 76 and the content area grows to 1364.
                collapsed ? "w-19" : "w-sidebar",
            )}
        >
            <button
                type="button"
                onClick={toggleSidebar}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className={cn(
                    "absolute top-6 -right-3 z-10 flex size-6 items-center justify-center rounded-pill",
                    "border border-border-subtle bg-bg-primary text-content-tertiary shadow-l2",
                    "transition-colors hover:text-content-primary",
                )}
            >
                <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={14}
                    strokeWidth={1.8}
                    className={cn("transition-transform", collapsed && "rotate-180")}
                />
            </button>

            <nav className="scrollbar-thin flex h-full flex-col overflow-y-auto p-4">
                {items.map((item) => {
                    const target = stripLocale(item.href(locale));
                    const active = path === target || path.startsWith(`${target}/`);
                    const Icon = item.icon;
                    const label = item.label(t);

                    return (
                        <div key={item.key}>
                            <Link
                                href={item.href(locale)}
                                aria-current={active ? "page" : undefined}
                                title={collapsed ? label : undefined}
                                className={cn(
                                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                                    collapsed && "justify-center px-0",
                                    active
                                        ? "bg-bg-brand text-content-inverse"
                                        : "text-content-secondary hover:bg-bg-secondary hover:text-content-primary",
                                )}
                            >
                                <HugeiconsIcon icon={Icon} size={18} strokeWidth={1.6} className="shrink-0" />
                                {collapsed ? null : <span className="truncate">{label}</span>}
                            </Link>

                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
