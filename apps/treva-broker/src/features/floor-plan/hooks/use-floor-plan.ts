"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { floorPlanService } from "../api/floor-plan.service";
import type { LayoutListQuery } from "../types";

export function useBuildings() {
    return useQuery({
        queryKey: queryKeys.floorPlan.buildings,
        queryFn: () => floorPlanService.buildings(),
    });
}

export function useBuilding(id: string | undefined) {
    return useQuery({
        queryKey: queryKeys.floorPlan.floors(id ?? ""),
        queryFn: () => floorPlanService.building(id!),
        // The building list has to resolve before there is an id to ask for.
        enabled: Boolean(id),
    });
}

/** The Layouts tab's current page; only fetched while that tab is open. */
export function useLayouts(buildingId: string, query: LayoutListQuery, enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.floorPlan.layouts(buildingId, query),
        queryFn: () => floorPlanService.layouts(buildingId, query),
        enabled,
        // Keep the current page on screen while the next one loads.
        placeholderData: (previous) => previous,
    });
}
