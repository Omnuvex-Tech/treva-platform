"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Building, Unit, UnitStatus } from "../types";

/** The rule across the top of a card, in the unit's own status colour. */
const STATUS_BAR: Record<UnitStatus, string> = {
    available: "bg-content-positive",
    reserved: "bg-content-notice",
    sold: "bg-content-negative",
    blocked: "bg-border-tertiary",
};

const STATUS_TONE: Record<UnitStatus, "positive" | "notice" | "negative" | "neutral"> = {
    available: "positive",
    reserved: "notice",
    sold: "negative",
    blocked: "neutral",
};

export interface UnitCardsProps {
    building: Building;
    selectedUnitId: string | null;
    onSelect: (unit: Unit) => void;
    /** When set, every other status drops its colour, as the grid does. */
    filter?: UnitStatus | null;
}

/**
 * The Properties tab (873:50111).
 *
 * The same inventory the stacking grid shows, drawn as cards four across and
 * grouped by floor, with the floor number sitting in its own column down the
 * left. Each card is a coloured rule over the code and price, the status badge
 * top right, and a two-column spec block underneath.
 *
 * A legend filter dims the cards it excludes rather than removing them, so the
 * floors keep their shape while one status is being read.
 */
export function UnitCards({ building, selectedUnitId, onSelect, filter }: UnitCardsProps) {
    const { locale, t } = useI18n();

    return (
        <div className="flex flex-col gap-3">
            {building.floors.map((floor) => (
                <div key={floor.level} className="flex items-stretch gap-3">
                    <span className="flex w-6 shrink-0 items-center justify-center text-sm text-content-tertiary">
                        {floor.level}
                    </span>

                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {floor.units.slice(0, 4).map((unit) => {
                            const muted =
                                filter !== null && filter !== undefined && filter !== unit.status;

                            return (
                                <button
                                    key={unit.id}
                                    type="button"
                                    onClick={() => onSelect(unit)}
                                    className={cn(
                                        "overflow-hidden rounded-md border border-border-subtle bg-bg-primary text-left transition-all",
                                        unit.id === selectedUnitId && "bg-bg-secondary",
                                        muted && "opacity-40",
                                    )}
                                >
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "block h-1 w-full",
                                            muted ? "bg-border-tertiary" : STATUS_BAR[unit.status],
                                        )}
                                    />

                                    <span className="flex items-start justify-between gap-2 px-3 pt-2">
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs text-content-disabled">
                                                {unit.code}
                                            </span>
                                            <span className="block truncate text-base font-semibold text-content-primary">
                                                {formatCurrency(unit.price, locale)}
                                            </span>
                                        </span>

                                        <Badge
                                            tone={muted ? "neutral" : STATUS_TONE[unit.status]}
                                            className="shrink-0 px-2 py-1 text-xs font-medium tracking-normal normal-case"
                                        >
                                            {t.floorPlan.legend[unit.status]}
                                        </Badge>
                                    </span>

                                    {/* Floor / Type over Area / Loggia, both columns
                                        label-above-value (873:50111). */}
                                    <span className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 px-3 pb-3 text-xs">
                                        <span className="text-content-disabled">
                                            {t.floorPlan.card.floor}
                                        </span>
                                        <span className="text-content-disabled">
                                            {t.floorPlan.card.type}
                                        </span>
                                        <span className="text-content-secondary">
                                            {unit.floor}. NP
                                        </span>
                                        <span className="text-content-secondary">
                                            {unit.bedrooms}+1
                                        </span>

                                        <span className="text-content-disabled">
                                            {t.floorPlan.card.area}
                                        </span>
                                        <span className="text-content-disabled">
                                            {t.floorPlan.card.loggia}
                                        </span>
                                        <span className="text-content-secondary">
                                            {unit.areaSqm} m²
                                        </span>
                                        <span className="text-content-secondary">
                                            {unit.loggiaSqm} m²
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
