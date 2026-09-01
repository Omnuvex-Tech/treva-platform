"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { floorPlanService } from "../api/floor-plan.service";

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
