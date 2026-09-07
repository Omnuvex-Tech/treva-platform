"use client";

import { cn } from "@/lib/utils/cn";
import type { Building, Unit, UnitStatus } from "../types";

/**
 * Status → cell fill (873:48952…873:48959).
 *
 * The grid cells are flat: a subtle fill, a 4px radius, no border. That is the
 * one difference from the legend swatch, which puts the same fill inside a 1px
 * edge of the full-strength hue.
 *
 * The ink is the darkened step of each hue so the unit number stays legible on
 * the pale fill. The artboard leaves its cells empty, but the number is what
 * keeps the grid readable without relying on colour alone — four statuses on
 * 28px squares is exactly where colour-only encoding fails.
 */
const STATUS_CELL: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle text-content-positive-bold",
    reserved: "bg-bg-notice-subtle text-[var(--color-content-notice-bold)]",
    sold: "bg-bg-negative-subtle text-[var(--color-content-negative-bold)]",
    blocked: "bg-bg-tertiary text-content-tertiary",
};

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
}

/**
 * The unit-availability matrix: one row per floor, one 28px cell per unit,
 * exactly as laid out in artboard 873:48904 (18 floors x 8 units), cells 3px
 * apart on a 4px radius.
 */
export function StackingPlan({ building, selectedUnitId, onSelect, filter }: StackingPlanProps) {
    const unitsPerFloor = building.floors[0]?.units.length ?? 0;

    // Fixed label column, then one 28px square per unit — the cell size in the
    // artboard. The grid keeps its natural width and the card shrinks to it,
    // rather than stretching the squares into rectangles.
    const rowTemplate = {
        gridTemplateColumns: `2rem repeat(${unitsPerFloor}, 1.75rem)`,
    };

    return (
        <div className="scrollbar-thin overflow-x-auto">
            <div className="flex w-fit flex-col gap-[3px]">
                {/* Column header: unit position down each stack. */}
                <div className="grid items-center gap-[3px]" style={rowTemplate}>
                    <span />
                    {Array.from({ length: unitsPerFloor }, (_, index) => (
                        <span key={index} className="text-center text-2xs text-content-tertiary">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    ))}
                </div>

                {building.floors.map((floor) => (
                    <div
                        key={floor.level}
                        className="grid items-center gap-[3px]"
                        style={rowTemplate}
                    >
                        <span className="pr-1 text-right text-2xs text-content-tertiary">
                            {floor.label}
                        </span>

                        {floor.units.map((unit) => {
                            const selected = unit.id === selectedUnitId;
                            const muted = filter !== null && filter !== undefined && filter !== unit.status;

                            return (
                                <button
                                    key={unit.id}
                                    type="button"
                                    onClick={() => onSelect(unit)}
                                    aria-pressed={selected}
                                    // Screen readers get the full story; the
                                    // visible label is just the position digits.
                                    aria-label={`Unit ${unit.code}, ${unit.status}`}
                                    title={`${unit.code} · ${unit.status}`}
                                    className={cn(
                                        "size-7 rounded-xxs text-2xs font-medium transition-all",
                                        "hover:z-10 hover:scale-110",
                                        muted
                                            ? "bg-bg-secondary text-content-disabled"
                                            : STATUS_CELL[unit.status],
                                        selected && "ring-2 ring-content-link ring-offset-1",
                                    )}
                                >
                                    {String(unit.position).padStart(2, "0")}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
