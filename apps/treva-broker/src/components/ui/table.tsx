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
                className={cn("w-full border-collapse text-left text-sm", className)}
                {...props}
            />
        </div>
    );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("bg-bg-secondary", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={cn("divide-y divide-border-subtle", className)} {...props} />;
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
                // 34px header row / 40px body row, per the table content block
                // in 873:49772 — the artboards' th and td instances.
                "h-[34px] px-4 text-xs font-medium whitespace-nowrap text-content-tertiary",
                className,
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={cn("h-10 px-4 text-sm text-content-primary", className)} {...props} />;
}
