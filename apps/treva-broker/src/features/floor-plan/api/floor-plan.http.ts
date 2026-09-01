import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { Building, BuildingSummary } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function buildings(): Promise<BuildingSummary[]> {
    return http.get<BuildingSummary[]>(endpoints.floorPlan.buildings);
}

export async function building(id: string): Promise<Building> {
    return http.get<Building>(endpoints.floorPlan.floors(id));
}
