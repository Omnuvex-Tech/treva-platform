"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, visibleNavItems, type NavItem } from "@/config/navigation";
import { stripLocale } from "@/config/page-meta";
import { useSession } from "@/providers/session-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useUiStore } from "@/stores/ui-store";

export function Sidebar() {
    const pathname = usePathname();
    const { locale, t } = useI18n();
    const { can } = useSession();
    const collapsed = useUiStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUiStore((state) => state.toggleSidebar);

    // The nav is filtered by permission, not by role — see config/navigation.ts.
    // This is what makes the Admin Panel group appear for admins only, with no
    // per-role nav array anywhere in the app.
    const items = visibleNavItems(NAV_ITEMS, can);
    const path = stripLocale(pathname);

    return (
        <aside
            className={cn(
                "relative shrink-0 border-r border-border-subtle bg-bg-primary transition-[width] duration-200",
                // 76px collapsed — measured off the collapsed-sidebar artboard
                // (873:48750), where the rail is 76 and content grows to 1364.
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
                <ChevronLeft className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
            </button>

            <nav className="flex h-full flex-col gap-0.5 overflow-y-auto p-4 scrollbar-thin">
                {items.map((item) => (
                    <SidebarItem
                        key={item.key}
                        item={item}
                        currentPath={path}
                        collapsed={collapsed}
                        renderLabel={(navItem) => navItem.label(t)}
                        locale={locale}
                    />
                ))}
            </nav>
        </aside>
    );
}

interface SidebarItemProps {
    item: NavItem;
    currentPath: string;
    collapsed: boolean;
    renderLabel: (item: NavItem) => string;
    locale: Parameters<NavItem["href"]>[0];
}

function SidebarItem({ item, currentPath, collapsed, renderLabel, locale }: SidebarItemProps) {
    const href = item.href(locale);
    const target = stripLocale(href);

    // A parent (Admin Panel) is "active" for any path beneath its group, so the
    // group stays highlighted while a child page is open.
    const groupPath = item.children?.length ? `/${item.key}` : target;
    const active = currentPath === target || currentPath.startsWith(`${groupPath}/`);
    const Icon = item.icon;

    return (
        <div>
            <Link
                href={href}
                aria-current={currentPath === target ? "page" : undefined}
                title={collapsed ? renderLabel(item) : undefined}
                className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                        ? "bg-bg-brand text-content-inverse"
                        : "text-content-secondary hover:bg-bg-secondary hover:text-content-primary",
                )}
            >
                <Icon className="size-4 shrink-0" />
                {collapsed ? null : <span className="truncate">{renderLabel(item)}</span>}
            </Link>

            {/* Hairline between rows, matching the sidebar in the artboards. */}
            {collapsed ? null : <span className="mx-3 block h-px bg-border-subtle" />}

            {item.children?.length && active && !collapsed ? (
                <div className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l border-border-subtle pl-3">
                    {item.children.map((child) => {
                        const childTarget = stripLocale(child.href(locale));
                        const childActive = currentPath === childTarget;
                        const ChildIcon = child.icon;

                        return (
                            <Link
                                key={child.key}
                                href={child.href(locale)}
                                aria-current={childActive ? "page" : undefined}
                                className={cn(
                                    "flex h-9 items-center gap-2.5 rounded-s px-2.5 text-xs font-medium transition-colors",
                                    childActive
                                        ? "bg-bg-secondary text-content-primary"
                                        : "text-content-tertiary hover:text-content-primary",
                                )}
                            >
                                <ChildIcon className="size-3.5 shrink-0" />
                                <span className="truncate">{renderLabel(child)}</span>
                            </Link>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
