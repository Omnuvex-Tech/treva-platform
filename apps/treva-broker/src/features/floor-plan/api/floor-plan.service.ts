import { config } from "@/config";
import type { Building, BuildingSummary } from "../types";

import * as httpAdapter from "./floor-plan.http";
import * as mockAdapter from "./floor-plan.mock";

export interface FloorPlanService {
    buildings(): Promise<BuildingSummary[]>;
    building(id: string): Promise<Building>;
}

export const floorPlanService: FloorPlanService = config.api.useMock ? mockAdapter : httpAdapter;
