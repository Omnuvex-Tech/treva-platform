import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden
            className={cn("animate-pulse rounded-s bg-bg-tertiary", className)}
            {...props}
        />
    );
}

/** Placeholder shaped like the news/project card grid. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-lg border border-border-subtle bg-bg-primary p-4"
                >
                    <Skeleton className="h-5 w-20 rounded-pill" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-7 w-24 rounded-s" />
                </div>
            ))}
        </div>
    );
}

/** Placeholder shaped like a data table. */
export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-bg-primary">
            {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-4 px-4 py-3">
                    {Array.from({ length: columns }, (_, columnIndex) => (
                        <Skeleton key={columnIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}
