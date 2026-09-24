"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { NAV_ITEMS, visibleNavItems } from "@/config/navigation";
import { stripLocale } from "@/config/page-meta";
import { useSession } from "@/providers/session-provider";
import { useI18n } from "@/providers/i18n-provider";
import { useUiStore } from "@/stores/ui-store";

/**
 * The navigation rail (`Sidebar`, 873:49176).
 *
 * 280 wide on white with the brand pattern laid over it, closed by a 1px
 * Border/Subtle rule. The rows are 248x44 white tiles 4px apart inside a 16px
 * inset, starting 25px down (the 1px `Top` frame plus the 24px gap): 16px
 * side padding, a 14px glyph 12px from a 14/Regular label. The active row
 * fills with Background/Brand on Shadow/L7 and inks everything white.
 *
 * The collapse chip is the 29px `Expand icon`: 29 from the top, hanging 15px
 * past the rail's edge, 12px radius, with its own two-layer drop shadow.
 *
 * Figma draws the rule inside the 280, so a CSS border takes one pixel the
 * artboard does not: the nav pads 15 on its right and the chip offsets 16 from
 * the padding edge, which lands both on the artboard's pixels.
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
                "relative shrink-0 border-r border-border-subtle bg-bg-primary transition-[width] duration-200",
                "bg-[url(/images/layout/sidebar-pattern.png)] bg-cover bg-center bg-no-repeat",
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
                    "absolute top-[29px] -right-4 z-10 flex size-[29px] items-center justify-center p-1",
                    "rounded-md border border-border-inverse bg-bg-primary text-content-brand",
                    "shadow-[0px_4px_4px_rgba(0,0,0,0.1),0px_0px_2px_rgba(0,0,0,0.08)]",
                )}
            >
                <AssetIcon
                    src="/images/layout/icon-chevron-left.svg"
                    size={16}
                    className={cn("transition-transform", collapsed && "rotate-180")}
                />
            </button>

            <nav className="scrollbar-thin flex h-full flex-col gap-1 overflow-x-clip overflow-y-auto pt-[25px] pr-[15px] pb-6 pl-4">
                {items.map((item) => {
                    const target = stripLocale(item.href(locale));
                    const active = path === target || path.startsWith(`${target}/`);
                    const label = item.label(t);

                    return (
                        <Link
                            key={item.key}
                            href={item.href(locale)}
                            aria-current={active ? "page" : undefined}
                            title={collapsed ? label : undefined}
                            className={cn(
                                "flex h-11 shrink-0 items-center gap-3 overflow-clip rounded-md px-4 py-3 text-sm transition-colors",
                                collapsed && "justify-center px-0",
                                active
                                    ? "bg-bg-brand text-content-inverse shadow-l7"
                                    : "bg-bg-primary text-content-primary hover:bg-bg-secondary",
                            )}
                        >
                            <AssetIcon src={item.iconSrc} size={14} glyph={item.iconGlyph} />
                            {collapsed ? null : <span className="min-w-0 flex-1 truncate">{label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
