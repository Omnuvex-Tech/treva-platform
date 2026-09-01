"use client";

import { cn } from "@/lib/utils/cn";
import type { Building, Unit, UnitStatus } from "../types";

/**
 * Status → cell treatment.
 *
 * Every state carries a distinct *fill and border*, and the cell always prints
 * its unit number, so the grid stays readable without relying on hue alone —
 * which matters here because four statuses on 28px squares is exactly where
 * colour-only encoding fails.
 */
const STATUS_CELL: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle border-content-positive text-content-positive-bold",
    reserved: "bg-bg-notice-subtle border-content-notice text-content-notice",
    sold: "bg-bg-brand border-bg-brand text-content-inverse",
    blocked: "bg-bg-tertiary border-border-tertiary text-content-disabled",
};

export const STATUS_SWATCH: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle border-content-positive",
    reserved: "bg-bg-notice-subtle border-content-notice",
    sold: "bg-bg-brand border-bg-brand",
    blocked: "bg-bg-tertiary border-border-tertiary",
};

export interface StackingPlanProps {
    building: Building;
    selectedUnitId: string | null;
    onSelect: (unit: Unit) => void;
}

/**
 * The unit-availability matrix: one row per floor, one 28px cell per unit,
 * exactly as laid out in artboard 873:48904 (18 floors x 8 units).
 */
export function StackingPlan({ building, selectedUnitId, onSelect }: StackingPlanProps) {
    const unitsPerFloor = building.floors[0]?.units.length ?? 0;

    // Fixed label column, then one 28px square per unit — the cell size in the
    // artboard. The grid keeps its natural width and the card shrinks to it,
    // rather than stretching the squares into rectangles.
    const rowTemplate = {
        gridTemplateColumns: `2rem repeat(${unitsPerFloor}, 1.75rem)`,
    };

    return (
        <div className="scrollbar-thin overflow-x-auto">
            <div className="flex w-fit flex-col gap-1.5">
                {/* Column header: unit position down each stack. */}
                <div className="grid items-center gap-1" style={rowTemplate}>
                    <span />
                    {Array.from({ length: unitsPerFloor }, (_, index) => (
                        <span key={index} className="text-center text-[10px] text-content-tertiary">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    ))}
                </div>

                {building.floors.map((floor) => (
                    <div key={floor.level} className="grid items-center gap-1" style={rowTemplate}>
                        <span className="pr-1 text-right text-[10px] text-content-tertiary">
                            {floor.label}
                        </span>

                        {floor.units.map((unit) => {
                            const selected = unit.id === selectedUnitId;

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
                                        "size-7 rounded-xs border text-[10px] font-medium transition-transform",
                                        "hover:z-10 hover:scale-110",
                                        STATUS_CELL[unit.status],
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
