"use client";

import { LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useBuilding, useBuildings } from "../hooks/use-floor-plan";
import { UNIT_STATUSES, type Unit, type UnitStatus } from "../types";
import { STATUS_SWATCH, StackingPlan } from "./stacking-plan";

const STATUS_TONE: Record<UnitStatus, "positive" | "notice" | "brand" | "neutral"> = {
    available: "positive",
    reserved: "notice",
    sold: "brand",
    blocked: "neutral",
};

/**
 * Floor Plan: a building selector, the status legend with live counts, the
 * stacking grid, and a detail panel for whichever unit is selected.
 */
export function FloorPlanView() {
    const { locale, t } = useI18n();

    const [buildingId, setBuildingId] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    const buildingsQuery = useBuildings();
    const buildingQuery = useBuilding(buildingId ?? buildingsQuery.data?.[0]?.id);

    // Pin the first building once the list arrives, so the tab strip has a
    // selected item on first paint instead of flashing empty.
    useEffect(() => {
        if (!buildingId && buildingsQuery.data?.[0]) {
            setBuildingId(buildingsQuery.data[0].id);
        }
    }, [buildingId, buildingsQuery.data]);

    const building = buildingQuery.data;
    const tabs: TabItem<string>[] =
        buildingsQuery.data?.map((entry) => ({ value: entry.id, label: entry.name })) ?? [];

    const totalUnits = building
        ? UNIT_STATUSES.reduce((sum, status) => sum + building.counts[status], 0)
        : 0;

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {tabs.length > 0 ? (
                    <Tabs
                        items={tabs}
                        value={buildingId ?? tabs[0]!.value}
                        onChange={(value) => {
                            setBuildingId(value);
                            setSelectedUnit(null);
                        }}
                    />
                ) : (
                    <Skeleton className="h-10 w-70 rounded-md" />
                )}

                {building ? (
                    <p className="text-sm text-content-tertiary">
                        {interpolate(t.floorPlan.totalUnits, {
                            total: formatNumber(totalUnits, locale),
                        })}
                    </p>
                ) : null}
            </div>

            {/* Legend doubles as the count readout from the artboard. */}
            {building ? (
                <div className="flex flex-wrap items-center gap-4">
                    {UNIT_STATUSES.map((status) => (
                        <span key={status} className="inline-flex items-center gap-1.5 text-xs">
                            <span
                                aria-hidden
                                className={cn("size-3 rounded-xs border", STATUS_SWATCH[status])}
                            />
                            <span className="text-content-secondary">{t.floorPlan.legend[status]}</span>
                            <span className="font-semibold text-content-primary">
                                {building.counts[status]}
                            </span>
                        </span>
                    ))}
                </div>
            ) : null}

            {buildingQuery.isPending ? (
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
                <div className="grid gap-4 lg:grid-cols-[auto_18rem]">
                    <Card className="w-fit">
                        <CardContent>
                            <StackingPlan
                                building={building}
                                selectedUnitId={selectedUnit?.id ?? null}
                                onSelect={setSelectedUnit}
                            />
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>
                                {selectedUnit
                                    ? interpolate(t.floorPlan.unit, { code: selectedUnit.code })
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
                </div>
            ) : null}
        </div>
    );
}
