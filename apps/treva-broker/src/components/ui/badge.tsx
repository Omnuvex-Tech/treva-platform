import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide",
    {
        variants: {
            tone: {
                /** "New" pill on news cards. */
                positive: "bg-bg-positive-subtle text-content-positive-bold",
                /** "ANNOUNCEMENTS" pill on news cards. */
                notice: "bg-bg-notice-subtle text-content-notice",
                info: "bg-bg-info-subtle text-content-link",
                negative: "bg-bg-negative-subtle text-content-negative",
                neutral: "bg-bg-tertiary text-content-secondary",
                brand: "bg-bg-brand text-content-inverse",
            },
            size: {
                sm: "px-2 py-0.5 text-2xs",
                md: "px-2.5 py-1 text-xs",
                /**
                 * The status pill that stands in for a form control
                 * (I1173:18675;11095:28383) — 12/Medium in sentence case. The
                 * base is built for the card pills ("NEW", "ANNOUNCEMENTS"),
                 * which are upper case and tracked out; a sentence reading
                 * "Approved until 5 Aug 2026" cannot wear either.
                 */
                field: "px-2 py-1 text-xs font-medium tracking-normal normal-case",
            },
        },
        defaultVariants: {
            tone: "neutral",
            size: "sm",
        },
    },
);

export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

/**
 * The dot form of the same component — `Badge, Type=2` (I873:48552).
 *
 * No fill and no radius: a 6px disc 4px from a 12/Regular label on
 * Content/Tertiary, boxed at 80px minimum so a column of them lines up whether
 * it reads "Active" or "Deactive". Only the disc carries the status colour,
 * which is why this cannot be the pill above with a smaller padding.
 */
const dotTones = {
    positive: "bg-content-positive",
    /** Figma's "processing" blue — what Deactive is drawn in. */
    info: "bg-content-link",
    notice: "bg-content-notice",
    negative: "bg-content-negative",
    neutral: "bg-content-disabled",
} as const;

export type StatusBadgeTone = keyof typeof dotTones;

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: StatusBadgeTone;
}

export function StatusBadge({ className, tone = "neutral", children, ...props }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex min-w-20 items-center gap-1 px-2 py-1 text-xs whitespace-nowrap text-content-tertiary",
                className,
            )}
            {...props}
        >
            <span aria-hidden className={cn("size-1.5 shrink-0 rounded-pill", dotTones[tone])} />
            {children}
        </span>
    );
}

export { badgeVariants };
