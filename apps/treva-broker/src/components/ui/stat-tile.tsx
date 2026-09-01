import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface StatTileProps {
    label: string;
    value: string;
    /** Percentage change against the previous period; omit when there is none. */
    delta?: number;
    hint?: string;
    /** Any icon node — the app is mid-migration from lucide to hugeicons. */
    icon?: ReactNode;
    className?: string;
}

/**
 * A single headline number. The right answer whenever a "chart" would have
 * plotted exactly one value — a 260x136 tile is the KPI row in the Finance
 * artboard.
 *
 * The trend arrow carries an icon as well as a colour, so direction is never
 * communicated by colour alone.
 */
export function StatTile({ label, value, delta, hint, icon, className }: StatTileProps) {
    const rising = (delta ?? 0) >= 0;
    const TrendIcon = rising ? TrendingUp : TrendingDown;

    return (
        <div
            className={cn(
                "flex min-w-0 flex-col justify-between gap-3 rounded-lg border border-border-subtle bg-bg-primary p-4",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-content-tertiary">{label}</p>
                {icon ? (
                    <span className="shrink-0 text-content-tertiary [&_svg]:size-4">{icon}</span>
                ) : null}
            </div>

            <div>
                <p className="truncate text-2xl font-medium text-content-primary">{value}</p>

                {delta === undefined ? (
                    hint ? <p className="mt-0.5 text-xs text-content-tertiary">{hint}</p> : null
                ) : (
                    <p
                        className={cn(
                            "mt-0.5 inline-flex items-center gap-1 text-xs font-medium",
                            rising ? "text-content-positive-bold" : "text-content-negative",
                        )}
                    >
                        <TrendIcon className="size-3.5" />
                        {rising ? "+" : ""}
                        {delta.toFixed(1)}%
                        {hint ? (
                            <span className="font-normal text-content-tertiary">{hint}</span>
                        ) : null}
                    </p>
                )}
            </div>
        </div>
    );
}
