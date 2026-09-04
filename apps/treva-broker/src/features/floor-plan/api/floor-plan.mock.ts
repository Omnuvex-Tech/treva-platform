import { delay } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_BUILDINGS } from "@/mocks/floor-plan";
import { UNIT_STATUSES, type Building, type BuildingSummary } from "../types";

export async function buildings(): Promise<BuildingSummary[]> {
    await delay(180);

    return MOCK_BUILDINGS.map((entry) => {
        const units = entry.floors.flatMap((floor) => floor.units);

        return {
            id: entry.id,
            name: entry.name,
            projectName: entry.projectName,
            floors: entry.floors.length,
            unitsTotal: UNIT_STATUSES.reduce((sum, status) => sum + entry.counts[status], 0),
            // "From" price: the cheapest unit still on the market.
            priceFrom: Math.min(...units.map((unit) => unit.price)),
            imageUrl: null,
        };
    });
}

export async function building(id: string): Promise<Building> {
    await delay();

    const found = MOCK_BUILDINGS.find((entry) => entry.id === id);
    if (!found) throw new ApiError("Building not found", 404, "not_found");

    return found;
}
