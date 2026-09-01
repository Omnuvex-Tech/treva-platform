import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
    /** Any icon node — the app is mid-migration from lucide to hugeicons. */
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * The "nothing to show" panel (artboard 873:49358).
 *
 * Measured from the empty Clients screen: a full-width card exactly 240 tall
 * whose content block is centred both ways — a 60x60 round icon well, 12px of
 * gap, then a single 14px line. It is a solid card like every other panel in
 * the file, not a dashed placeholder box, and the design has no second line of
 * copy under the message.
 *
 * `description` and `action` are kept for the error variant, which reuses this
 * panel to offer a retry; no artboard draws them, so they render only when a
 * caller asks for them.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex h-60 flex-col items-center justify-center gap-3 rounded-lg border border-border-subtle bg-bg-primary px-6 text-center",
                className,
            )}
        >
            {icon ? (
                <span className="flex size-15 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary [&_svg]:size-6">
                    {icon}
                </span>
            ) : null}

            <p className="text-sm text-content-tertiary">{title}</p>

            {description ? (
                <p className="max-w-sm text-sm text-content-tertiary">{description}</p>
            ) : null}
            {action ? <div className="mt-1">{action}</div> : null}
        </div>
    );
}
