"use client";

import { LayoutGrid } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { MOCK_LAYOUTS } from "@/mocks/floor-plan";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useBuilding } from "../hooks/use-floor-plan";
import { FLOOR_PLAN_VIEWS, UNIT_STATUSES, type FloorPlanView, type Unit, type UnitStatus } from "../types";
import { LayoutsGrid } from "./layouts-grid";
import { STATUS_SWATCH, StackingPlan } from "./stacking-plan";
import { UnitCards } from "./unit-cards";

const STATUS_TONE: Record<UnitStatus, "positive" | "notice" | "brand" | "neutral"> = {
    available: "positive",
    reserved: "notice",
    sold: "brand",
    blocked: "neutral",
};

/** The Layouts tab's own control, 134x44 in the headline (873:50496). */
const SORTS = ["lowestPrice", "highestPrice", "largestArea"] as const;

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
    const { locale, t } = useI18n();

    const [view, setView] = useState<FloorPlanView>("grid");
    const [sort, setSort] = useState<string>("lowestPrice");
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    // Clicking a legend entry keeps only that status in colour; clicking the
    // active one again clears it.
    const [filter, setFilter] = useState<UnitStatus | null>(null);

    const buildingQuery = useBuilding(buildingId);

    const building = buildingQuery.data;

    const tabs: TabItem<FloorPlanView>[] = FLOOR_PLAN_VIEWS.map((value) => ({
        value,
        label: t.floorPlan.views[value],
    }));

    /** Grid+ and its Layouts twin are the two states drawn with a rail. */
    const withRail = view === "gridPlus";

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            {/* 873:48931 — 60 tall, the strip inset 8; Layouts adds the sort. */}
            <div className="flex h-15 items-center justify-between gap-3 px-2">
                <Tabs
                    variant="pill"
                    items={tabs}
                    value={view}
                    onChange={(value) => {
                        setView(value);
                        setSelectedUnit(null);
                        setFilter(null);
                    }}
                    className="h-9"
                />

                {view === "layouts" ? (
                    <Select
                        value={sort}
                        onChange={setSort}
                        options={SORTS.map((value) => ({
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
                <div className="flex flex-wrap items-center gap-x-7 gap-y-2 px-2">
                    {UNIT_STATUSES.map((status) => (
                        <button
                            key={status}
                            type="button"
                            aria-pressed={filter === status}
                            onClick={() => setFilter((current) => (current === status ? null : status))}
                            className={cn(
                                "inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 text-2xs text-content-brand transition-opacity",
                                filter !== null && filter !== status && "opacity-40",
                                filter === status && "bg-bg-secondary",
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn("size-3 rounded-xxs border", STATUS_SWATCH[status])}
                            />
                            {t.floorPlan.legend[status]}
                            {/* Blocked carries no count in the file (873:48947). */}
                            {status === "blocked" ? null : (
                                <span className="text-[var(--color-content-tertiary-inverse)]">
                                    {building.counts[status]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            ) : null}

            <div className="px-2">
                {view === "layouts" ? (
                    <LayoutsGrid layouts={MOCK_LAYOUTS} />
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
                    <div
                        className={cn(
                            "grid gap-4",
                            withRail && "lg:grid-cols-[minmax(0,1fr)_18rem]",
                        )}
                    >
                        <Card className={view === "properties" ? "p-5" : "w-fit"}>
                            {view === "properties" ? (
                                <UnitCards
                                    building={building}
                                    selectedUnitId={selectedUnit?.id ?? null}
                                    onSelect={setSelectedUnit}
                                    filter={filter}
                                />
                            ) : (
                                <CardContent>
                                    <StackingPlan
                                        building={building}
                                        selectedUnitId={selectedUnit?.id ?? null}
                                        onSelect={setSelectedUnit}
                                        filter={filter}
                                    />
                                </CardContent>
                            )}
                        </Card>

                        {withRail ? (
                            <Card className="h-fit">
                                <CardHeader>
                                    <CardTitle>
                                        {selectedUnit
                                            ? interpolate(t.floorPlan.unit, {
                                                  code: selectedUnit.code,
                                              })
                                            : t.floorPlan.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    {selectedUnit ? (
                                        <dl className="flex flex-col gap-3 text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-content-tertiary">
                                                    {t.users.columns.status}
                                                </dt>
                                                <dd>
                                                    <Badge tone={STATUS_TONE[selectedUnit.status]}>
                                                        {t.floorPlan.legend[selectedUnit.status]}
                                                    </Badge>
                                                </dd>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-content-tertiary">
                                                    {interpolate(t.floorPlan.floor, {
                                                        level: selectedUnit.floor,
                                                    })}
                                                </dt>
                                                <dd className="text-content-primary">
                                                    {interpolate(t.floorPlan.specs, {
                                                        beds: selectedUnit.bedrooms,
                                                        area: selectedUnit.areaSqm,
                                                    })}
                                                </dd>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
                                                <dt className="text-content-tertiary">
                                                    {t.projects.from}
                                                </dt>
                                                <dd className="text-base font-semibold text-content-primary">
                                                    {formatCurrency(selectedUnit.price, locale)}
                                                </dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <p className="text-sm text-content-tertiary">
                                            {t.floorPlan.selectUnit}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
