"use client";

import { LayoutGrid } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { useBuilding, useLayouts } from "../hooks/use-floor-plan";
import {
    FLOOR_PLAN_VIEWS,
    LAYOUT_SORTS,
    UNIT_STATUSES,
    type FloorPlanView,
    type LayoutSort,
    type Unit,
    type UnitStatus,
} from "../types";
import { LayoutsGrid } from "./layouts-grid";
import { STATUS_SWATCH, StackingPlan } from "./stacking-plan";
import { UnitCards } from "./unit-cards";
import { UnitRail } from "./unit-rail";

/**
 * The Tab panel's four tabs (873:48933) keep one size whichever is selected:
 * 56 / 60 / 89 / 74 wide, the first padded 14 and the rest 12. Minimums, so a
 * longer translation still fits its label.
 */
const TAB_SIZE: Record<FloorPlanView, string> = {
    grid: "min-w-14 px-3.5",
    gridPlus: "min-w-15 px-3",
    properties: "min-w-[89px] px-3",
    layouts: "min-w-[74px] px-3",
};

/** The Layouts tab is paged by the API, 20 layouts at a time. */
const LAYOUTS_PER_PAGE = 20;

/**
 * Floor Plan (artboards 873:48904 / 873:49834 / 873:50111 / 873:50474).
 *
 * Four tabs over one inventory, and the file opens on the first:
 *
 * - Grid — the stacking plan across the full 1128 column
 * - Grid+ — the same plan at 853 beside the unit rail
 * - Properties — the units as cards, four across and grouped by floor
 * - Layouts — the floor drawings, with a sort control in the headline
 *
 * The headline holds nothing but the tab strip (and, on Layouts, that sort).
 * Which building is on screen comes from the route: Floor Plan opens on the
 * Listings screen (886:15740) and a card there leads here, which is the order
 * the artboards sit in on the canvas.
 */
export interface FloorPlanViewProps {
    buildingId: string;
}

export function FloorPlanView({ buildingId }: FloorPlanViewProps) {
    const { t } = useI18n();

    const [view, setView] = useState<FloorPlanView>("grid");
    // The Layouts tab's own control, 134x44 in the headline (873:50496), and
    // its page; a new sort starts again from the first page.
    const [sort, setSort] = useState<LayoutSort>("lowestPrice");
    const [layoutsPage, setLayoutsPage] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    // Clicking a legend entry keeps only that status in colour; clicking the
    // active one again clears it.
    const [filter, setFilter] = useState<UnitStatus | null>(null);

    const buildingQuery = useBuilding(buildingId);
    const layoutsQuery = useLayouts(
        buildingId,
        { page: layoutsPage, perPage: LAYOUTS_PER_PAGE, sort },
        view === "layouts",
    );

    const building = buildingQuery.data;

    const tabs: TabItem<FloorPlanView>[] = FLOOR_PLAN_VIEWS.map((value) => ({
        value,
        label: t.floorPlan.views[value],
        // Figma strokes the selected pill inside its box, so the edge must not
        // push the label the way a CSS border would.
        className: cn(
            TAB_SIZE[value],
            value === view && "border-0 ring-1 ring-border-inverse ring-inset",
        ),
    }));

    /** Grid+ is the state drawn with a rail (873:49834). */
    /**
     * The rail opens beside Grid+ (873:49834), and picking a unit on Properties
     * or a layout on Layouts opens it the same way; plain Grid moves to Grid+.
     */
    const withRail = view !== "grid";

    /**
     * Picking a unit on the plain Grid moves to Grid+.
     *
     * Grid has no rail to show the unit in, so a click there would otherwise
     * do nothing visible — the artboards put the rail on Grid+ and that is the
     * tab a selection belongs to.
     */
    function selectUnit(unit: Unit) {
        setSelectedUnit(unit);
        if (view === "grid") setView("gridPlus");
    }

    return (
        // 873:49851 — with the rail out, the column and the rail are two
        // half-white panels on Background/Secondary: the column 2 in from the
        // left, the rail 12 after it and 2 short of the right edge.
        <div className={cn("flex min-h-full items-stretch gap-3", withRail && selectedUnit && "bg-bg-secondary px-0.5")}>
            {/* No gap between the blocks: the artboard stacks the 60px headline,
                the 38px legend row and the card flush (y 16 / 76 / 114). */}
            <div
                className={cn(
                    "flex min-w-0 flex-1 flex-col px-4 pt-4 pb-8",
                    withRail && selectedUnit && "bg-bg-primary/50",
                )}
            >
            {/* 873:48931 — 60 tall, the 36px strip inset 8; Layouts adds the sort. */}
            <div className="flex h-15 items-center justify-between gap-3 px-2">
                <Tabs
                    variant="pill"
                    size="sm"
                    items={tabs}
                    value={view}
                    onChange={(value) => {
                        setView(value);
                        setSelectedUnit(null);
                        setFilter(null);
                    }}
                />

                {view === "layouts" ? (
                    <Select
                        value={sort}
                        onChange={(value) => {
                            setSort(value as LayoutSort);
                            setLayoutsPage(1);
                        }}
                        options={LAYOUT_SORTS.map((value) => ({
                            value,
                            label: t.floorPlan.sorts[value],
                        }))}
                        aria-label={t.floorPlan.sortBy}
                        className="h-11 rounded-lg border-border-subtle bg-bg-primary"
                        containerClassName="w-[134px] shrink-0"
                    />
                ) : null}
            </div>

            {/* The legend is the count readout, and Layouts is the one tab the
                artboard draws without it. */}
            {building && view !== "layouts" ? (
                // 873:48934 — 12 above and below, entries 28 apart, each a
                // 12px swatch 4 from its "Label count" line. No padding on the
                // entries themselves: a picked filter shows by dimming the rest.
                <div className="flex flex-wrap items-center gap-x-7 gap-y-2 px-2 py-3">
                    {UNIT_STATUSES.map((status) => (
                        <button
                            key={status}
                            type="button"
                            aria-pressed={filter === status}
                            onClick={() => setFilter((current) => (current === status ? null : status))}
                            className={cn(
                                "inline-flex items-center gap-1 text-2xs text-content-brand transition-opacity",
                                filter !== null && filter !== status && "opacity-40",
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn("size-3 rounded-xxs border", STATUS_SWATCH[status])}
                            />
                            <span>
                                {t.floorPlan.legend[status]}
                                {/* Blocked carries no count in the file (873:48947). */}
                                {status === "blocked" ? null : (
                                    <>
                                        {" "}
                                        <span className="text-[var(--color-content-tertiary-inverse)]">
                                            {building.counts[status]}
                                        </span>
                                    </>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Properties is the one block drawn flush with the column (x 16);
                the grid and Layouts are inset 8 more. */}
            <div className={view === "properties" ? undefined : "px-2"}>
                {view === "layouts" ? (
                    layoutsQuery.isPending ? (
                        <Skeleton className="h-95 w-full rounded-xl" />
                    ) : layoutsQuery.isError ? (
                        <EmptyState
                            icon={<LayoutGrid />}
                            title={t.common.error}
                            action={
                                <Button variant="outline" onClick={() => layoutsQuery.refetch()}>
                                    {t.common.retry}
                                </Button>
                            }
                        />
                    ) : (
                        <>
                            {/* The cards keep their size with the rail out and
                                the row scrolls sideways, as the grid card does. */}
                            <div className="scrollbar-thin overflow-x-auto">
                                <LayoutsGrid
                                    fixedColumns
                                    layouts={layoutsQuery.data.items}
                                    selectedId={selectedUnit?.id ?? null}
                                    onSelect={(layout) => {
                                        // A layout is keyed by the first unit
                                        // that shares it, so that unit is the
                                        // one the rail shows.
                                        const unit = building?.floors
                                            .flatMap((floor) => floor.units)
                                            .find((entry) => entry.id === layout.id);
                                        if (unit) setSelectedUnit(unit);
                                    }}
                                />
                            </div>

                            {layoutsQuery.data.totalPages > 1 ? (
                                <Pagination
                                    variant="rounded"
                                    className="mt-8"
                                    page={layoutsQuery.data.page}
                                    totalPages={layoutsQuery.data.totalPages}
                                    onPageChange={setLayoutsPage}
                                    summary={interpolate(t.common.showing, {
                                        from: (layoutsQuery.data.page - 1) * layoutsQuery.data.perPage + 1,
                                        to: Math.min(
                                            layoutsQuery.data.page * layoutsQuery.data.perPage,
                                            layoutsQuery.data.total,
                                        ),
                                        total: layoutsQuery.data.total,
                                    })}
                                />
                            ) : null}
                        </>
                    )
                ) : buildingQuery.isPending ? (
                    <Skeleton className="h-150 w-full rounded-lg" />
                ) : buildingQuery.isError ? (
                    <EmptyState
                        icon={<LayoutGrid />}
                        title={t.common.error}
                        action={
                            <Button variant="outline" onClick={() => buildingQuery.refetch()}>
                                {t.common.retry}
                            </Button>
                        }
                    />
                ) : building ? (
                    view === "properties" ? (
                        <UnitCards
                            building={building}
                            selectedUnitId={selectedUnit?.id ?? null}
                            onSelect={selectUnit}
                            filter={filter}
                        />
                    ) : (
                        // 873:48949 — the full column wide on the XXL (12)
                        // radius; it scrolls sideways when a building has more
                        // stacks than fit.
                        <div className="scrollbar-thin overflow-x-auto rounded-md border border-border-subtle bg-bg-primary">
                            <StackingPlan
                                building={building}
                                selectedUnitId={selectedUnit?.id ?? null}
                                onSelect={selectUnit}
                                filter={filter}
                                showLayoutCounts={view === "gridPlus"}
                            />
                        </div>
                    )
                ) : null}
                </div>
            </div>

            {/* 873:50064 — the rail is a SIBLING of the content column and
                starts at its top edge, level with the tab strip, not below the
                legend. It only appears once a unit is picked. */}
            {withRail && building && selectedUnit ? (
                <UnitRail
                    building={building}
                    unit={selectedUnit}
                    onClose={() => setSelectedUnit(null)}
                />
            ) : null}
        </div>
    );
}
