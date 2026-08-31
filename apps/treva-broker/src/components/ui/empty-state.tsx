import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-bg-primary px-6 py-14 text-center",
                className,
            )}
        >
            {Icon ? (
                <span className="mb-1 flex size-11 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary">
                    <Icon className="size-5" />
                </span>
            ) : null}

            <p className="text-base font-semibold text-content-primary">{title}</p>
            {description ? (
                <p className="max-w-sm text-sm text-content-tertiary">{description}</p>
            ) : null}
            {action ? <div className="mt-3">{action}</div> : null}
        </div>
    );
}
