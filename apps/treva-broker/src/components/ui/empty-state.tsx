import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
    /** Any icon node — the app is mid-migration from lucide to hugeicons. */
    icon?: ReactNode;
    /**
     * The 60x60 illustration the design actually draws, rendered raw in an 8px
     * rounded well. Takes precedence over `icon`, which keeps the grey circle
     * for the screens that only have a glyph to show.
     */
    media?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * The "nothing to show" panel (artboard 873:49359).
 *
 * Measured from the empty Clients screen: a card exactly 240 tall with a 12px
 * radius, whose content block is centred both ways — a 60x60 illustration with
 * an 8px radius, 12px of gap, then a single 14/Medium line on Content/Secondary.
 * It is a solid card like every other panel in the file, not a dashed
 * placeholder box, and the design has no second line of copy under the message.
 *
 * `description` and `action` are kept for the error variant, which reuses this
 * panel to offer a retry; no artboard draws them, so they render only when a
 * caller asks for them.
 */
export function EmptyState({
    icon,
    media,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex h-60 flex-col items-center justify-center gap-3 rounded-md border border-border-subtle bg-bg-primary px-4 py-3 text-center",
                className,
            )}
        >
            {media ? (
                <span className="size-15 overflow-hidden rounded-sm">{media}</span>
            ) : icon ? (
                <span className="flex size-15 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary [&_svg]:size-6">
                    {icon}
                </span>
            ) : null}

            <p className="text-sm font-medium text-content-secondary">{title}</p>

            {description ? (
                <p className="max-w-sm text-sm text-content-tertiary">{description}</p>
            ) : null}
            {action ? <div className="mt-1">{action}</div> : null}
        </div>
    );
}
