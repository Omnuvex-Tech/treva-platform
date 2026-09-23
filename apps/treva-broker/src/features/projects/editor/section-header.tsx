import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface SectionHeaderProps {
    title: string;
    description: string;
    /** Rendered hard right — Live Availability puts its switch there. */
    action?: ReactNode;
    /**
     * Key Highlights draws its heading differently from the other four
     * (873:51128): the title is 16/Bold rather than 16/Semibold, the two lines
     * sit 4 apart instead of the description carrying a 2px top pad, and the
     * whole block is inset a further 8 past the cards below it.
     */
    variant?: "default" | "highlights";
}

/**
 * The heading every section of the project editor opens with (873:51231).
 *
 * A 16/Semibold title over a 14/Regular line of Content/Secondary — 42 tall,
 * the description in a 22px paragraph with 2 of top padding — and 12 of air
 * before the section's body.
 */
export function SectionHeader({
    title,
    description,
    action,
    variant = "default",
}: SectionHeaderProps) {
    const highlights = variant === "highlights";

    return (
        <div className={cn("flex items-start justify-between gap-4", highlights ? "px-4" : "px-2")}>
            <div className={cn("flex min-w-0 flex-col", highlights && "gap-1")}>
                <h2
                    className={cn(
                        "truncate text-base text-content-primary",
                        highlights ? "font-bold" : "font-semibold",
                    )}
                >
                    {title}
                </h2>
                <p className={cn("truncate text-sm text-content-secondary", !highlights && "pt-0.5")}>
                    {description}
                </p>
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
