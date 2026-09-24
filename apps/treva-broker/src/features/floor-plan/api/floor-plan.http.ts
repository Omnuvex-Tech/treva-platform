import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { Paginated } from "@/lib/api/types";
import type { Building, BuildingSummary, Layout, LayoutListQuery } from "../types";

/**
 * Real adapter against apps/treva-broker-api, used while
 * NEXT_PUBLIC_USE_MOCK_FLOOR_PLAN is "0". It reads the broker's own copy of the
 * inventory, which the Projects screen's Synchronize button fills from
 * treva-api — never treva-api itself. The API answers in these exact shapes
 * (see FloorPlanService there), so there is no mapping here.
 */
export async function buildings(): Promise<BuildingSummary[]> {
    return http.get<BuildingSummary[]>(endpoints.floorPlan.buildings);
}

export async function building(id: string): Promise<Building> {
    return http.get<Building>(endpoints.floorPlan.floors(id));
}

export async function layouts(
    buildingId: string,
    query: LayoutListQuery = {},
): Promise<Paginated<Layout>> {
    return http.get<Paginated<Layout>>(endpoints.floorPlan.layouts(buildingId), {
        params: { page: query.page, perPage: query.perPage, sort: query.sort },
    });
}
