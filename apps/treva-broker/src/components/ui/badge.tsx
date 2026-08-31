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

export { badgeVariants };
