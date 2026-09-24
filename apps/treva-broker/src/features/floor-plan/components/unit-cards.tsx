"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";

import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Building, Unit, UnitStatus } from "../types";

/** The 4px rule across the top of a card (873:50167), in the status colour. */
const STATUS_BAR: Record<UnitStatus, string> = {
    available: "bg-content-positive",
    reserved: "bg-content-notice",
    sold: "bg-content-negative",
    blocked: "bg-border-tertiary",
};

/** The status pill (873:50154): the subtle fill with the full-strength ink. */
const STATUS_BADGE: Record<UnitStatus, string> = {
    available: "bg-bg-positive-subtle text-content-positive",
    reserved: "bg-bg-notice-subtle text-content-notice",
    sold: "bg-bg-negative-subtle text-content-negative",
    blocked: "bg-bg-tertiary text-content-tertiary",
};

/** 12/Regular labels and values in the spec block (873:50156). */
const LABEL = "text-[var(--color-content-tertiary-inverse)]";

/** The Scrollbar — Custom thumb is 33 long on its track (873:50472). */
const MIN_THUMB = 33;

export interface UnitCardsProps {
    building: Building;
    selectedUnitId: string | null;
    onSelect: (unit: Unit) => void;
    /** When set, every other status drops its colour, as the grid does. */
    filter?: UnitStatus | null;
}

/**
 * The 248.75 x 161 UnitCard (873:50148): a 12px radius, 13 in from the outer
 * edge, the status rule over the top edge. The code (10/Medium) sits 4 above
 * the price (16/Semibold) with the pill beside them, then 12 to a 1px rule and
 * 12 more to Floor / Area and Type / Loggia — two fixed 42 and 37 columns 52
 * apart.
 *
 * Figma draws the 1px edge over the card's contents, so the 4px rule shows
 * 3px under it; the edge is therefore its own layer on top rather than a
 * border, which CSS would paint beneath the rule.
 */
function UnitCard({
    unit,
    selected,
    muted,
    onSelect,
}: {
    unit: Unit;
    selected: boolean;
    muted: boolean;
    onSelect: (unit: Unit) => void;
}) {
    const { locale, t } = useI18n();
    const status: UnitStatus = muted ? "blocked" : unit.status;

    return (
        <button
            type="button"
            onClick={() => onSelect(unit)}
            aria-pressed={selected}
            className={cn(
                "relative flex h-[161px] w-[248.75px] shrink-0 flex-col gap-3 overflow-hidden rounded-md p-[13px] text-left transition-opacity",
                selected ? "bg-bg-secondary" : "bg-bg-primary",
                muted && "opacity-40",
            )}
        >
            <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", STATUS_BAR[status])} />

            <span className="flex w-full items-center justify-between">
                <span className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap">
                    <span className={cn("text-2xs font-medium", LABEL)}>{unit.code}</span>
                    <span className="text-base leading-5 font-semibold text-content-brand">
                        {formatCurrency(unit.price, locale)}
                    </span>
                </span>

                <span
                    className={cn(
                        "flex h-5 shrink-0 items-center justify-center rounded-pill px-2 text-xs font-medium whitespace-nowrap",
                        STATUS_BADGE[status],
                    )}
                >
                    {t.floorPlan.legend[unit.status]}
                </span>
            </span>

            <span aria-hidden className="h-px w-full shrink-0 rounded-pill bg-border-subtle" />

            <span className="flex w-full items-center gap-[52px] text-xs whitespace-nowrap">
                <span className="flex w-[42px] shrink-0 flex-col">
                    <span className={LABEL}>{t.floorPlan.card.floor}</span>
                    <span className="text-content-brand">{unit.floor}. NP</span>
                    <span className={LABEL}>{t.floorPlan.card.area}</span>
                    <span className="text-content-brand">{unit.areaSqm} m²</span>
                </span>
                <span className="flex w-[37px] shrink-0 flex-col">
                    <span className={LABEL}>{t.floorPlan.card.type}</span>
                    <span className="text-content-brand">{unit.bedrooms}+1</span>
                    <span className={LABEL}>{t.floorPlan.card.loggia}</span>
                    <span className="text-content-brand">{unit.loggiaSqm} m²</span>
                </span>
            </span>

            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-border-subtle ring-inset"
            />
        </button>
    );
}

type Axis = "x" | "y";

/**
 * A Scrollbar — Custom (873:50472 / 873:50473) bound to the viewport: a
 * Background/Secondary pill track with a #ccc thumb, draggable, and hidden
 * while there is nothing to scroll on its axis.
 */
function ScrollTrack({
    axis,
    viewport,
    className,
}: {
    axis: Axis;
    viewport: RefObject<HTMLDivElement | null>;
    className: string;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [thumb, setThumb] = useState<{ offset: number; size: number } | null>(null);
    const drag = useRef<{ start: number; scroll: number } | null>(null);

    const measure = useCallback(() => {
        const view = viewport.current;
        const track = trackRef.current;
        if (!view || !track) return;

        const client = axis === "x" ? view.clientWidth : view.clientHeight;
        const total = axis === "x" ? view.scrollWidth : view.scrollHeight;
        const position = axis === "x" ? view.scrollLeft : view.scrollTop;
        const length = axis === "x" ? track.clientWidth : track.clientHeight;

        if (total <= client + 1) {
            setThumb(null);
            return;
        }

        const size = Math.max(MIN_THUMB, (client / total) * length);
        setThumb({ offset: (position / (total - client)) * (length - size), size });
    }, [axis, viewport]);

    useEffect(() => {
        const view = viewport.current;
        if (!view) return;

        measure();
        view.addEventListener("scroll", measure, { passive: true });
        const observer = new ResizeObserver(measure);
        observer.observe(view);
        if (view.firstElementChild) observer.observe(view.firstElementChild);

        return () => {
            view.removeEventListener("scroll", measure);
            observer.disconnect();
        };
    }, [measure, viewport]);

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        const view = viewport.current;
        if (!view) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            start: axis === "x" ? event.clientX : event.clientY,
            scroll: axis === "x" ? view.scrollLeft : view.scrollTop,
        };
    }

    function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const view = viewport.current;
        const track = trackRef.current;
        if (!view || !track || !drag.current || !thumb) return;

        const length = axis === "x" ? track.clientWidth : track.clientHeight;
        const total = axis === "x" ? view.scrollWidth - view.clientWidth : view.scrollHeight - view.clientHeight;
        const moved = (axis === "x" ? event.clientX : event.clientY) - drag.current.start;
        const next = drag.current.scroll + moved * (total / (length - thumb.size));

        if (axis === "x") view.scrollLeft = next;
        else view.scrollTop = next;
    }

    return (
        <div
            ref={trackRef}
            aria-hidden
            className={cn("absolute rounded-pill bg-bg-secondary", !thumb && "invisible", className)}
        >
            {thumb ? (
                <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={() => (drag.current = null)}
                    className="absolute rounded-pill bg-border-tertiary"
                    style={
                        axis === "x"
                            ? { left: thumb.offset, width: thumb.size, top: 0, bottom: 0 }
                            : { top: thumb.offset, height: thumb.size, left: 0, right: 0 }
                    }
                />
            ) : null}
        </div>
    );
}

/**
 * The Properties tab (873:50111).
 *
 * One 1128 x 762 card on the XXL (12) radius, flush with the column rather than
 * inset 8 like the grid's. Inside, each floor is a single row of unit cards 12
 * apart, floors 12 apart and in ascending order, the floor number (16/Semibold)
 * 17 from the card's edge and centred on its row. The cards start 49 in and 41
 * down, four to the 1031px view; everything past that scrolls on both axes
 * behind two custom bars — a horizontal one along the bottom margin from the
 * floor numbers to the view's right edge, a vertical one in the right margin.
 *
 * The floor numbers stay put while the rows scroll sideways under them.
 *
 * A legend filter dims the cards it excludes rather than removing them, so the
 * floors keep their shape while one status is being read.
 */
export function UnitCards({ building, selectedUnitId, onSelect, filter }: UnitCardsProps) {
    const viewport = useRef<HTMLDivElement>(null);
    const floors = [...building.floors].sort((a, b) => a.level - b.level);

    return (
        <div className="relative h-[762px] overflow-hidden rounded-md bg-bg-primary ring-1 ring-border-subtle ring-inset">
            {/* From the inner edge to the cards' right edge (1080), 41 down to
                41 up: the floor-number column rides inside so it scrolls with
                its rows vertically, and sticks while they scroll sideways. */}
            <div
                ref={viewport}
                className="scrollbar-none absolute top-[41px] right-[48px] bottom-[41px] left-px overflow-auto"
            >
                <div className="flex w-max flex-col gap-3">
                    {floors.map((floor) => (
                        <div key={floor.level} className="flex">
                            <span className="sticky left-0 z-10 flex w-12 shrink-0 items-center bg-bg-primary pl-4 text-base leading-5 font-semibold text-[var(--color-content-tertiary-inverse)]">
                                {floor.level}
                            </span>

                            <div className="flex gap-3">
                                {[...floor.units]
                                    .sort((a, b) => a.position - b.position)
                                    .map((unit) => (
                                        <UnitCard
                                            key={unit.id}
                                            unit={unit}
                                            selected={unit.id === selectedUnitId}
                                            muted={
                                                filter !== null &&
                                                filter !== undefined &&
                                                filter !== unit.status
                                            }
                                            onSelect={onSelect}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 873:50472 — x 17 to the cards' right edge, 20 under the view:
                1063 x 8 in the 1128 card. */}
            <ScrollTrack axis="x" viewport={viewport} className="right-[48px] bottom-[13px] left-[17px] h-2" />
            {/* 873:50473 — 6 wide, 13 from the right edge, level with the view. */}
            <ScrollTrack axis="y" viewport={viewport} className="top-[41px] right-[13px] bottom-[41px] w-1.5" />
        </div>
    );
}
