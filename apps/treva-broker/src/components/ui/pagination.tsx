"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Optional "Showing 1–10 of 42" line rendered on the left. */
    summary?: string;
    className?: string;
}

export function Pagination({
    page,
    totalPages,
    onPageChange,
    summary,
    className,
}: PaginationProps) {
    if (totalPages <= 1 && !summary) return null;

    const pages = pageWindow(page, totalPages);

    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            {summary ? <p className="text-xs text-content-tertiary">{summary}</p> : <span />}

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="iconSm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                </Button>

                {pages.map((entry, index) =>
                    entry === "gap" ? (
                        <span
                            // Gaps carry no identity of their own; the slot
                            // position is the only stable thing about them.
                            key={`gap-${index}`}
                            className="px-1 text-xs text-content-tertiary"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={entry}
                            variant={entry === page ? "primary" : "outline"}
                            size="iconSm"
                            onClick={() => onPageChange(entry)}
                            aria-current={entry === page ? "page" : undefined}
                        >
                            {entry}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="iconSm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}

/**
 * Produces at most 7 slots: first, last, the current page with a neighbour on
 * each side, and "gap" markers for whatever is skipped. Keeps the control a
 * fixed width no matter how many pages the dataset has.
 */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const slots: (number | "gap")[] = [1];

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) slots.push("gap");
    for (let current = start; current <= end; current += 1) slots.push(current);
    if (end < totalPages - 1) slots.push("gap");

    slots.push(totalPages);

    return slots;
}
