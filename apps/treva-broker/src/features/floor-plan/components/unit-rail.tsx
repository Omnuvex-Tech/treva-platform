"use client";

import { Cancel01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Building, Unit } from "../types";

/** A 1px Border/Subtle rule (873:59096). */
function Divider() {
    return <span aria-hidden className="h-px w-full rounded-pill bg-border-subtle" />;
}

/**
 * One of the three stat cells under the unit number (873:59087).
 *
 * The value's unit — "m²", "/ 18" — is drawn a step lighter than the number
 * itself, which is why it comes in as a node rather than as part of the string.
 */
function Stat({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-1 flex-col p-2">
            <span className="truncate text-xs text-[var(--color-content-tertiary-inverse)]">
                {label}
            </span>
            <span className="text-xs text-content-brand">{children}</span>
        </div>
    );
}

/**
 * One line of Property details (873:59112).
 *
 * The artboard leaves most of these without a value — only the apartment
 * number, the address and the complex carry one — so a row with nothing to show
 * is the label on its own, exactly as drawn.
 */
function DetailRow({ label, value }: { label: string; value?: string }) {
    if (!value) {
        return (
            <p className="w-full text-xs text-[var(--color-content-tertiary-inverse)]">{label}</p>
        );
    }

    return (
        <div className="flex w-full items-start justify-between gap-3">
            <span className="shrink-0 text-xs text-[var(--color-content-tertiary-inverse)]">
                {label}
            </span>
            <span className="text-right text-xs text-content-brand">{value}</span>
        </div>
    );
}

export interface UnitRailProps {
    building: Building;
    unit: Unit;
    onClose: () => void;
    /**
     * Optional on purpose, and unwired for now. "Select unit" is the rail's one
     * action, but the artboard gives it nowhere to go — no reservation screen
     * exists in the file — so the button is drawn and the destination is left
     * to whoever adds that screen.
     */
    onSelectUnit?: (unit: Unit) => void;
}

/**
 * The unit rail on the Grid+ tab (artboard 873:59079).
 *
 * 259 wide with a 20px gutter, padded 24 top and bottom, its blocks 24 apart on
 * a half-white ground: the unit's number and three stats, then the floor plan
 * with its action, then pricing and the details list, each pair separated by a
 * 1px rule.
 *
 * Every label is Content/Tertiary Inverse and every value Content/Brand — the
 * rail reads as one quiet column with the price as its only emphasis.
 */
export function UnitRail({ building, unit, onClose, onSelectUnit }: UnitRailProps) {
    const { locale, t } = useI18n();
    const copy = t.floorPlan.rail;

    const totalFloors = building.floors.length;
    const pricePerSqm = unit.areaSqm > 0 ? Math.round(unit.price / unit.areaSqm) : 0;

    return (
        <aside className="flex w-[259px] shrink-0 flex-col gap-6 bg-bg-primary/50 px-5 py-6">
            <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--color-content-tertiary-inverse)]">
                            {copy.residentialUnit}
                        </p>
                        <p className="truncate text-sm font-semibold text-content-brand">
                            {interpolate(copy.unitNo, { code: unit.code })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={copy.close}
                        title={copy.close}
                        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-inverse bg-bg-tertiary text-content-secondary transition-colors hover:bg-border-tertiary"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.6} />
                    </button>
                </div>

                <div className="flex h-15 items-center gap-3">
                    <Stat label={copy.area}>
                        {unit.areaSqm}{" "}
                        <span className="text-[var(--color-content-tertiary-inverse)]">m²</span>
                    </Stat>
                    <Stat label={copy.floor}>
                        {unit.floor}{" "}
                        <span className="text-[var(--color-content-tertiary-inverse)]">
                            / {totalFloors}
                        </span>
                    </Stat>
                    <Stat label={copy.status}>{t.floorPlan.legend[unit.status]}</Stat>
                </div>
            </div>

            <Divider />

            <div className="flex flex-col gap-3">
                <p className="text-xs text-[var(--color-content-tertiary-inverse)]">
                    {copy.floorPlan}
                </p>

                {/* 873:59099 — a 121x108 drawing centred in a padded well. The
                    repo has no plan assets, so the well falls back rather than
                    inventing one. */}
                <div className="flex items-center justify-center rounded-md border border-border-subtle bg-bg-secondary p-[13px]">
                    <span className="flex h-27 w-30 items-center justify-center text-content-disabled">
                        <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                    </span>
                </div>

                <Button
                    type="button"
                    variant="brandOutline"
                    className="h-9 w-full rounded-lg"
                    onClick={() => onSelectUnit?.(unit)}
                >
                    {copy.selectUnit}
                </Button>
            </div>

            <div className="flex flex-col gap-5">
                <Divider />

                <div className="flex flex-col">
                    <p className="text-xs text-[var(--color-content-tertiary-inverse)]">
                        {copy.priceNote}
                    </p>
                    <p className="text-xl leading-7 font-semibold text-content-brand">
                        {formatCurrency(unit.price, locale)}
                    </p>
                    <p className="text-xs text-[var(--color-content-tertiary-inverse)]">
                        {interpolate(copy.pricePerSqm, {
                            price: formatCurrency(pricePerSqm, locale),
                        })}
                    </p>
                </div>

                <Divider />

                <div className="flex flex-col gap-6">
                    <p className="text-base font-medium text-[var(--color-content-tertiary-inverse)]">
                        {copy.propertyDetails}
                    </p>

                    <div className="flex flex-col gap-2">
                        <DetailRow label={copy.apartmentNumber} value={unit.code} />
                        <DetailRow label={copy.subType} />
                        <DetailRow label={copy.address} />
                        <DetailRow label={copy.buildingEntrance} />
                        <DetailRow label={copy.floorLabel} />
                        <DetailRow label={copy.buildingName} value={building.name} />
                        <DetailRow label={copy.complex} value={building.projectName} />
                        <DetailRow label={copy.totalArea} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
