import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The card the Users artboards call "Modal" (873:48706 / 873:48768 / 873:48508).
 *
 * Not the same surface as {@link Card}: this one is 12px (Border radius/XXL),
 * carries Shadow/L1 and has NO border, where `Card` is the 16px bordered flat
 * panel the rest of the app sits on. Padding is a fixed 20 on all four sides —
 * every artboard that uses it insets its content by exactly that, which is what
 * makes the 1072px table line up inside the 1112px card.
 *
 * `PanelTitle` is the head above it: 16/Bold on Content/Secondary, with room on
 * the right for the status badge the agent editor puts there (873:48840).
 */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("overflow-hidden rounded-md bg-bg-primary p-5 shadow-l1", className)}
            {...props}
        />
    );
}

export function PanelTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 text-base leading-5 font-bold text-content-secondary",
                className,
            )}
            {...props}
        />
    );
}
