import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { Building, BuildingSummary, Layout, LayoutListQuery } from "../types";

import * as httpAdapter from "./floor-plan.http";
import * as mockAdapter from "./floor-plan.mock";

export interface FloorPlanService {
    buildings(): Promise<BuildingSummary[]>;
    building(id: string): Promise<Building>;
    /** One page of a building's layouts, sorted server-side. */
    layouts(buildingId: string, query?: LayoutListQuery): Promise<Paginated<Layout>>;
}

export const floorPlanService: FloorPlanService = config.api.useMockFloorPlan
    ? mockAdapter
    : httpAdapter;
