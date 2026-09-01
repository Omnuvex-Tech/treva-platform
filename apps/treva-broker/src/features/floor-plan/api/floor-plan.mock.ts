import { delay } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_BUILDINGS } from "@/mocks/floor-plan";
import type { Building, BuildingSummary } from "../types";

export async function buildings(): Promise<BuildingSummary[]> {
    await delay(180);
    return MOCK_BUILDINGS.map(({ id, name }) => ({ id, name }));
}

export async function building(id: string): Promise<Building> {
    await delay();

    const found = MOCK_BUILDINGS.find((entry) => entry.id === id);
    if (!found) throw new ApiError("Building not found", 404, "not_found");

    return found;
}
