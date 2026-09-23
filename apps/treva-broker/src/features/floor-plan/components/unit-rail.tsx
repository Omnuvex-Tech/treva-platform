"use client";

import { Cancel01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Building, Unit } from "../types";

/** A 1px Border/Subtle rule (873:59096). */
function Divider() {
    return <span aria-hidden className="h-px w-full rounded-pill bg-border-subtle" />;
}

/**
 * The unit's drawing, which swaps every time the rail moves to another unit.
 *
 * It waits behind a spinner rather than fading the new plan in over the old
 * one: React reuses the same element across a `src` change, so without this the
 * previous unit's drawing stays on screen until the next decodes — and a plan
 * belonging to a different flat is a worse answer than no plan at all. The
 * caller keys this on the URL, which is what resets the wait.
 *
 * `unoptimized` is the reason it is quick. These are remote drawings on
 * Profitbase's CDN, and next's optimiser would put a server hop in front of
 * every first view — fetch, transform, re-serve — for line art that needs
 * neither resizing nor re-encoding. The browser goes straight to the source
 * instead, which is also what makes the grid's hover prefetch land in the same
 * cache entry (see StackingPlan).
 */
function PlanImage({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <span className="relative h-60 w-full">
            {loaded ? null : (
                <span className="absolute inset-0 flex items-center justify-center text-content-tertiary">
                    <span
                        aria-hidden
                        className="size-6 animate-spin rounded-pill border-2 border-current border-t-transparent"
                    />
                </span>
            )}

            <Image
                src={src}
                alt=""
                fill
                sizes="376px"
                unoptimized
                onLoad={() => setLoaded(true)}
                // A drawing the CDN will not serve must not spin for ever.
                onError={() => setLoaded(true)}
                className={cn(
                    "object-contain transition-opacity duration-200",
                    loaded ? "opacity-100" : "opacity-0",
                )}
            />
        </span>
    );
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
 * 440 wide (the artboard's 259, widened so the unit and its plan read
 * comfortably) with a 20px gutter, padded 24 top and bottom, its blocks 24 apart on
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
        <aside className="flex w-[440px] shrink-0 flex-col gap-6 bg-bg-primary/50 px-5 py-6">
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
                        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-inverse bg-bg-tertiary text-content-brand transition-colors hover:bg-border-tertiary"
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

                {/* 873:59099 — the drawing contained in a padded well, as wide
                    as the rail allows and 240 tall (the artboard's 121x108 was
                    too small to read once the rail widened). A unit
                    synchronised without a drawing falls back to the glyph
                    rather than to an invented plan. */}
                <div className="flex items-center justify-center rounded-md border border-border-subtle bg-bg-secondary p-3">
                    {unit.planImageUrl ? (
                        <PlanImage key={unit.planImageUrl} src={unit.planImageUrl} />
                    ) : (
                        <span className="flex h-60 w-full items-center justify-center text-content-disabled">
                            <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                        </span>
                    )}
                </div>

                <Button
                    type="button"
                    variant="brandOutline"
                    className="h-9 w-full rounded-lg bg-transparent"
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
