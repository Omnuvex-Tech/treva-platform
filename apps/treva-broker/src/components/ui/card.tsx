import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The surface every panel in the design sits on: white fill, 1px subtle border,
 * 16px radius. Elevation is opt-in — most cards in the CRM are flat and rely on
 * the border, only overlays and popovers take a shadow.
 */
export function Card({
    className,
    elevated = false,
    ...props
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
    return (
        <div
            className={cn(
                "rounded-lg border border-border-subtle bg-bg-primary",
                elevated && "shadow-l2",
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3",
                className,
            )}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-base font-semibold text-content-primary", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-xs text-content-tertiary", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3",
                className,
            )}
            {...props}
        />
    );
}
