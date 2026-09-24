"use client";

import { useMemo, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import type { Building, Unit, UnitStatus } from "../types";

/**
 * Status → cell fill (873:48952…873:48959).
 *
 * The grid cells are flat and empty, as the artboard draws them: a subtle
 * fill, a 4px radius, no border and no label. That is the one difference from
 * the legend swatch, which puts the same fill inside a 1px edge of the
 * full-strength hue. The status is still spoken and shown on hover through
 * each cell's label and title.
 */
const STATUS_CELL: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle",
    reserved: "bg-bg-notice-subtle",
    sold: "bg-bg-negative-subtle",
    blocked: "bg-bg-tertiary",
};

/** The darker step of each hue, so a count stays legible on the pale fill. */
const STATUS_INK: Record<UnitStatus, string> = {
    available: "text-content-positive-bold",
    reserved: "text-[var(--color-content-notice-bold)]",
    sold: "text-[var(--color-content-negative-bold)]",
    blocked: "text-content-tertiary",
};

/**
 * Per unit: the layout it belongs to, and how many units share it — the "7
 * property" on its Layouts card. Grouped exactly as apps/treva-broker-api's
 * `layoutsOf` does (room count and area to one decimal, blocked units left
 * out), so the two agree.
 *
 * The key travels with the count because selecting a unit lights up the rest
 * of its layout: two units are siblings when their keys match.
 */
function layoutGroups(building: Building): Map<string, { key: string; count: number }> {
    const keyOf = (unit: Unit) => `${unit.bedrooms}|${unit.areaSqm.toFixed(1)}`;
    const units = building.floors.flatMap((floor) => floor.units);
    const sizes = new Map<string, number>();

    for (const unit of units) {
        if (unit.status === "blocked") continue;
        sizes.set(keyOf(unit), (sizes.get(keyOf(unit)) ?? 0) + 1);
    }

    return new Map(
        units
            .filter((unit) => unit.status !== "blocked")
            .map((unit) => [unit.id, { key: keyOf(unit), count: sizes.get(keyOf(unit)) ?? 0 }]),
    );
}

/** 10/Regular in Content/Tertiary Inverse — the floor and stack labels. */
const AXIS_LABEL = "text-2xs text-[var(--color-content-tertiary-inverse)]";

/**
 * The four legend swatches (873:48937…873:48946).
 *
 * Same fills as the cells, each inside a 1px edge of the full-strength hue —
 * Sold is NOT the brand ink an earlier pass used, it is Negative, and Blocked
 * is the brand edge on Background/Teritary.
 */
export const STATUS_SWATCH: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle border-[var(--color-border-positive)]",
    reserved: "bg-bg-notice-subtle border-border-notice",
    sold: "bg-bg-negative-subtle border-border-negative",
    blocked: "bg-bg-tertiary border-border-brand",
};

export interface StackingPlanProps {
    building: Building;
    selectedUnitId: string | null;
    onSelect: (unit: Unit) => void;
    /** When set, every other status drops to a neutral fill. */
    filter?: UnitStatus | null;
    /**
     * Grid+ writes on each cell how many units share its layout, the count its
     * Layouts card shows. Plain Grid keeps the artboard's empty cells.
     */
    showLayoutCounts?: boolean;
}

/**
 * The unit-availability matrix inside its card, as laid out in artboard
 * 873:48904 (18 floors x 8 units): 28px cells 3px apart across a floor and 4px
 * apart between floors, on a 4px radius.
 *
 * The card's 41/49px inset (1px edge + 40/48 here) holds the axis labels, which
 * the artboard positions absolutely inside that margin rather than giving them
 * a column of their own: the stack numbers 13px from the card's top, each floor
 * label 17px from its left edge, vertically centred on its row.
 *
 * Real buildings are not a perfect rectangle — a penthouse floor has fewer
 * units than a typical one — so each unit goes in the column of its own
 * `position` rather than the next free cell, and the grid is as wide as the
 * highest position on any floor. Gaps stay empty. The caller's card scrolls
 * sideways when that is wider than the column.
 *
 * Selecting a unit also outlines every other unit of the same layout, which is
 * the question the counts raise and cannot answer: the cell says "14", this
 * says which fourteen.
 */
export function StackingPlan({
    building,
    selectedUnitId,
    onSelect,
    filter,
    showLayoutCounts,
}: StackingPlanProps) {
    const groups = useMemo(() => layoutGroups(building), [building]);

    /**
     * Warms the browser cache with a unit's drawing while the pointer is still
     * on its cell, so the rail has it by the time the click lands.
     *
     * The URL is fetched raw, which is the same one UnitRail renders through an
     * `unoptimized` image — go through next's optimiser at either end and the
     * two would be different cache entries, and this would buy nothing. The Set
     * is what keeps a mouse swept across the grid from firing a request per
     * cell it crosses.
     */
    const prefetched = useRef(new Set<string>());

    function prefetchPlan(unit: Unit) {
        const url = unit.planImageUrl;
        if (!url || prefetched.current.has(url)) return;

        prefetched.current.add(url);
        new window.Image().src = url;
    }

    // Which layout is lit: the selected unit's, so its siblings can outline
    // themselves without touching their status fill.
    const selectedKey = selectedUnitId ? (groups.get(selectedUnitId)?.key ?? null) : null;

    const unitsPerFloor = Math.max(
        0,
        ...building.floors.flatMap((floor) => floor.units.map((unit) => unit.position)),
    );

    // One 28px square per unit; the grid keeps its natural width rather than
    // stretching the squares into rectangles.
    const rowTemplate = { gridTemplateColumns: `repeat(${unitsPerFloor}, 28px)` };

    return (
        <div className="relative w-fit px-12 py-10">
            {/* 873:48922 — the stack numbers, 13 from the card's top edge. */}
            <div className="absolute top-3 left-12 grid gap-[3px]" style={rowTemplate}>
                {Array.from({ length: unitsPerFloor }, (_, index) => (
                    <span key={index} className={cn("text-center", AXIS_LABEL)}>
                        {String(index + 1).padStart(2, "0")}
                    </span>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                {building.floors.map((floor) => (
                    <div key={floor.level} className="relative">
                        {/* 873:49115… — 17 from the card's left edge. */}
                        <span className={cn("absolute inset-y-0 -left-8 flex items-center", AXIS_LABEL)}>
                            {floor.label}
                        </span>

                        <div className="grid gap-[3px]" style={rowTemplate}>
                            {floor.units.map((unit) => {
                                const selected = unit.id === selectedUnitId;
                                const muted =
                                    filter !== null && filter !== undefined && filter !== unit.status;
                                const group = groups.get(unit.id);
                                const count = showLayoutCounts ? group?.count : undefined;
                                const sibling =
                                    !selected && selectedKey !== null && group?.key === selectedKey;

                                return (
                                    <button
                                        key={unit.id}
                                        type="button"
                                        onClick={() => onSelect(unit)}
                                        onMouseEnter={() => prefetchPlan(unit)}
                                        onFocus={() => prefetchPlan(unit)}
                                        aria-pressed={selected}
                                        style={{ gridColumn: unit.position }}
                                        aria-label={`Unit ${unit.code}, ${unit.status}`}
                                        title={
                                            count
                                                ? `${unit.code} · ${unit.status} · ${count}`
                                                : `${unit.code} · ${unit.status}`
                                        }
                                        className={cn(
                                            "flex size-7 items-center justify-center rounded-xxs text-2xs font-medium tabular-nums transition-all",
                                            "hover:z-10 hover:scale-110",
                                            muted
                                                ? "bg-bg-secondary text-content-disabled"
                                                : cn(STATUS_CELL[unit.status], STATUS_INK[unit.status]),
                                            // Drawn inside the cell: an outer ring
                                            // this thick would spill into the 3px
                                            // gutter and collide wherever two of
                                            // the group sit side by side. Inset,
                                            // it reads as a border and every cell
                                            // keeps its status fill.
                                            sibling && "ring-2 ring-inset ring-content-link",
                                            selected && "ring-2 ring-content-link ring-offset-1",
                                        )}
                                    >
                                        {count || null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
