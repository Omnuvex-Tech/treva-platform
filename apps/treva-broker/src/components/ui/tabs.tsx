"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string = string> {
    value: T;
    label: string;
    count?: number;
}

export type TabsVariant = "track" | "pill";

export interface TabsProps<T extends string = string> {
    items: readonly TabItem<T>[];
    value: T;
    onChange: (value: T) => void;
    variant?: TabsVariant;
    className?: string;
}

/**
 * The `tab` / `Tab panel` pair from the design.
 *
 * Two looks, because the file draws two:
 *
 * - `track` — a segmented control on a grey track, what the list screens use.
 * - `pill` — the panel on a client's screen (873:49450). No track and no
 *   padding: the tabs sit straight on the page and only the selected one is
 *   drawn, as a 44px #ebebeb pill with a white border and brand-ink label. The
 *   panel's own fill is Background/Primary (12%), which over the app grey is a
 *   shade too small to see but is kept so the token survives a redesign.
 *
 * Sizes are off the artboard: 44 tall, 14px horizontal padding on the selected
 * tab and 12px on the rest, label 14/Medium.
 */
export function Tabs<T extends string = string>({
    items,
    value,
    onChange,
    variant = "track",
    className,
}: TabsProps<T>) {
    const pill = variant === "pill";

    return (
        <div
            role="tablist"
            className={cn(
                "inline-flex items-center",
                pill
                    ? "overflow-hidden rounded-t-md bg-white/12"
                    : "gap-1 rounded-md bg-bg-secondary p-1",
                className,
            )}
        >
            {items.map((item) => {
                const active = item.value === value;

                return (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(item.value)}
                        className={cn(
                            "inline-flex items-center gap-1.5 font-medium transition-colors",
                            pill
                                ? "h-11 rounded-pill text-sm"
                                : "h-8 rounded-sm px-3 text-xs",
                            pill && (active ? "px-3.5" : "px-3"),
                            active
                                ? pill
                                    ? "border border-border-inverse bg-bg-tertiary text-content-brand"
                                    : "bg-bg-primary text-content-primary shadow-l2"
                                : pill
                                  ? "text-content-disabled hover:text-content-secondary"
                                  : "text-content-tertiary hover:text-content-primary",
                        )}
                    >
                        {item.label}
                        {typeof item.count === "number" ? (
                            <span
                                className={cn(
                                    "rounded-pill px-1.5 text-2xs",
                                    active
                                        ? "bg-bg-secondary text-content-secondary"
                                        : "bg-bg-tertiary text-content-tertiary",
                                )}
                            >
                                {item.count}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
