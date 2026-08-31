"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string = string> {
    value: T;
    label: string;
    count?: number;
}

export interface TabsProps<T extends string = string> {
    items: readonly TabItem<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

/**
 * The `tab` / `Tab panel` pair from the design — a segmented control on a grey
 * track, not underlined browser-style tabs.
 */
export function Tabs<T extends string = string>({ items, value, onChange, className }: TabsProps<T>) {
    return (
        <div
            role="tablist"
            className={cn("inline-flex items-center gap-1 rounded-md bg-bg-secondary p-1", className)}
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
                            "inline-flex h-8 items-center gap-1.5 rounded-s px-3 text-xs font-medium transition-colors",
                            active
                                ? "bg-bg-primary text-content-primary shadow-l2"
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
