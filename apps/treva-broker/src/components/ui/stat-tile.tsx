import { cn } from "@/lib/utils/cn";

export interface StatTileProps {
    label: string;
    value: string;
    /** The line under the value — "12.4% vs last month", "Top 15% of brokers". */
    note: string;
    /**
     * Prefixes `note` with an arrow and inks it. Left off, the note stays on
     * Content/Secondary with no arrow — what the Rank Position tile draws,
     * because "Top 15% of brokers" is a standing fact, not a movement.
     */
    trend?: "up" | "down";
    className?: string;
}

/**
 * A single headline number — the 260x136 tile in the Finance KPI row
 * (1173:17971). The right answer whenever a "chart" would have plotted exactly
 * one value.
 *
 * Both the label and the number are Content/Brand, not Content/Primary: the
 * tiles are the one surface in the app that inks its figure on the brand.
 *
 * The arrow is the literal glyph the artboard sets rather than an icon, and it
 * is what keeps direction from resting on colour alone.
 *
 * Heights come out of the type scale exactly: 24 padding + 20 label + 40 value
 * + 8 + 20 note + 24 padding = the artboard's 136.
 */
export function StatTile({ label, value, note, trend, className }: StatTileProps) {
    return (
        <div
            className={cn(
                "flex min-w-0 flex-col rounded-md border border-border-subtle bg-bg-primary p-6",
                className,
            )}
        >
            <p className="truncate text-sm font-medium text-content-brand">{label}</p>
            <p className="truncate text-3xl font-semibold text-content-brand">{value}</p>
            <p
                className={cn(
                    "mt-2 truncate text-sm",
                    trend === "up"
                        ? "text-content-positive-bold"
                        : trend === "down"
                          ? "text-content-negative"
                          : "text-content-secondary",
                )}
            >
                {trend ? `${trend === "up" ? "↑" : "↓"} ` : ""}
                {note}
            </p>
        </div>
    );
}
