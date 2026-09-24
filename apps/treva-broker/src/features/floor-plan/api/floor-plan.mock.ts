import { delay, paginate } from "@/lib/api/mock";
import type { Paginated } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { MOCK_BUILDINGS, MOCK_LAYOUTS } from "@/mocks/floor-plan";
import {
    UNIT_STATUSES,
    type Building,
    type BuildingSummary,
    type Layout,
    type LayoutListQuery,
    type LayoutSort,
} from "../types";

const LAYOUT_ORDER: Record<LayoutSort, (a: Layout, b: Layout) => number> = {
    lowestPrice: (a, b) => a.priceFrom - b.priceFrom,
    highestPrice: (a, b) => b.priceFrom - a.priceFrom,
    largestArea: (a, b) => b.areaSqm - a.areaSqm,
};

export async function buildings(): Promise<BuildingSummary[]> {
    await delay(180);

    return MOCK_BUILDINGS.map((entry) => {
        const units = entry.floors.flatMap((floor) => floor.units);

        return {
            id: entry.id,
            name: entry.name,
            // The fixtures carry no project ids; the name stands in for one.
            projectId: entry.projectName,
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

export async function layouts(
    buildingId: string,
    query: LayoutListQuery = {},
): Promise<Paginated<Layout>> {
    await delay();

    if (!MOCK_BUILDINGS.some((entry) => entry.id === buildingId)) {
        throw new ApiError("Building not found", 404, "not_found");
    }

    const sorted = [...MOCK_LAYOUTS].sort(LAYOUT_ORDER[query.sort ?? "lowestPrice"]);
    return paginate(sorted, { page: query.page, perPage: query.perPage ?? 20 });
}
