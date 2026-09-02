import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Table primitives matching the `th` / `td` components in the design.
 *
 * `Table` wraps itself in an `overflow-x-auto` container by design: the CRM has
 * several 10+ column tables and the page body must never scroll sideways.
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="scrollbar-thin w-full overflow-x-auto">
            <table
                // `border-separate` with zero spacing rather than
                // `border-collapse`: a collapsed border is shared between rows
                // and sits outside the cell's box, which pushed every 40px row
                // to 41. Separated borders stay inside the cell's border-box.
                className={cn(
                    "w-full border-separate border-spacing-0 text-left text-sm",
                    className,
                )}
                {...props}
            />
        </div>
    );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("bg-bg-secondary", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={className} {...props} />;
}

export function TableRow({
    className,
    interactive = false,
    ...props
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
    return (
        <tr
            className={cn(
                "transition-colors",
                interactive && "cursor-pointer hover:bg-bg-secondary",
                className,
            )}
            {...props}
        />
    );
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            scope="col"
            className={cn(
                // 34px header row / 40px body row with 12px side padding, per
                // the table content block in 873:49772 — the artboards' th and
                // td instances. Header type is 12/Medium on Content/Secondary.
                "h-[34px] px-3 text-xs font-medium whitespace-nowrap text-content-secondary",
                className,
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={cn(
                // The rule belongs to the cell, not to a `divide-y` on the body,
                // so the last row gets one too — which the design draws — and
                // with separated borders the 1px edge stays inside the 40.
                "h-10 border-b border-border-subtle px-3 text-xs text-content-brand-bold",
                className,
            )}
            {...props}
        />
    );
}
