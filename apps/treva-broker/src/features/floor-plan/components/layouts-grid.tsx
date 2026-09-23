"use client";

import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Layout } from "../types";

export interface LayoutsGridProps {
    layouts: readonly Layout[];
    /**
     * Always four columns: they share the full width, never narrower than
     * 260px, so a narrower column (the Floor Plan screen with its rail out)
     * scrolls sideways instead of reflowing.
     */
    fixedColumns?: boolean;
    /** Makes each card a button; the Floor Plan screen opens its unit rail. */
    onSelect?: (layout: Layout) => void;
    selectedId?: string | null;
}

/**
 * The Layouts tab (873:50474), and the same tiles on a project's own screen
 * (1173:16458) — both are instances of one Card component (13103:238).
 *
 * Four 260px cards 24 apart. A card is a 4XL (20) radius around a 280px plan
 * that repeats the radius, padded 8 / 8 / 12 from the outer edge (7 / 7 / 11
 * plus the 1px stroke Figma draws inside), with 12 down to a 4px-inset body:
 * the starting price beside the area, then 20 down to a full-width 28px pill
 * saying how many units share the layout. 380 tall in all.
 *
 * The block chip is pinned 96 from the plan's left edge and 8 from its top —
 * that is where the artboard puts it, not right-aligned.
 *
 * `planImageUrl` is null in every fixture: the artboard shows real
 * architectural drawings and the repo has no such asset, so the well falls back
 * to a placeholder rather than to an invented plan.
 */
export function LayoutsGrid({ layouts, fixedColumns, onSelect, selectedId }: LayoutsGridProps) {
    const { locale, t } = useI18n();

    return (
        // Four columns 24 apart stretched across the width (260px each in the
        // 1112 column). Elsewhere the grid takes as many 260px columns as fit.
        <div
            className={cn(
                "grid gap-6",
                fixedColumns
                    ? "w-full min-w-max grid-cols-[repeat(4,minmax(260px,1fr))]"
                    : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]",
            )}
        >
            {layouts.map((layout) => (
                <article
                    key={layout.id}
                    role={onSelect ? "button" : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                    aria-pressed={onSelect ? layout.id === selectedId : undefined}
                    onClick={onSelect ? () => onSelect(layout) : undefined}
                    onKeyDown={
                        onSelect
                            ? (event) => {
                                  if (event.key !== "Enter" && event.key !== " ") return;
                                  event.preventDefault();
                                  onSelect(layout);
                              }
                            : undefined
                    }
                    className={cn(
                        "flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-primary px-[7px] pt-[7px] pb-[11px]",
                        onSelect && "cursor-pointer transition-shadow hover:shadow-l2",
                        onSelect && layout.id === selectedId && "border-border-brand",
                    )}
                >
                    <div className="relative h-70 w-full shrink-0">
                        <div
                            className={cn(
                                "absolute inset-0 overflow-hidden rounded-xl",
                                // Drawings are on white; a grey well would show
                                // as bands beside a contained plan.
                                layout.planImageUrl ? "bg-bg-primary" : "bg-bg-secondary",
                            )}
                        >
                            {layout.planImageUrl ? (
                                // Contained, not cropped: a floor plan is read
                                // whole, so it keeps its own proportions inside
                                // the 280px well.
                                <Image
                                    src={layout.planImageUrl}
                                    alt=""
                                    fill
                                    sizes="244px"
                                    className="object-contain"
                                />
                            ) : (
                                <span className="flex size-full items-center justify-center text-content-disabled">
                                    <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                                </span>
                            )}
                        </div>

                        {/* I873:50499;13103:274 — Background/Teritary on a 4XL
                            radius, 12/Medium in Content/Tertiary. */}
                        <span className="absolute top-2 left-24 max-w-[calc(100%-96px)] truncate rounded-xl bg-bg-tertiary px-2 py-1 text-xs font-medium whitespace-nowrap text-content-tertiary">
                            {layout.label}
                        </span>
                    </div>

                    <div className="flex flex-col gap-5 px-1">
                        <div className="flex items-start gap-3">
                            <span className="min-w-0 flex-1 truncate text-base font-semibold text-content-primary">
                                {interpolate(t.floorPlan.layout.priceFrom, {
                                    price: formatCurrency(layout.priceFrom, locale),
                                })}
                            </span>
                            {/* 14/Medium in brand, with the 2 set at 9.03px; Figma
                                draws its top level with the digits', 2px above
                                where CSS puts a top-aligned 9px glyph. */}
                            <span className="h-5 shrink-0 text-sm font-medium whitespace-nowrap text-content-brand">
                                {formatNumber(layout.areaSqm, locale)} m
                                <span className="relative -top-[2px] align-top text-[9.03px] leading-5">2</span>
                            </span>
                        </div>

                        <span className="flex h-7 items-center justify-center rounded-lg bg-bg-tertiary px-2 py-1 text-sm font-medium text-content-brand">
                            {interpolate(t.floorPlan.layout.properties, {
                                count: layout.propertyCount,
                            })}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    );
}
