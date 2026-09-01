import { delay, searchBy } from "@/lib/api/mock";
import { MOCK_LISTINGS } from "@/mocks/listings";
import type { ListingListQuery, ListingSections } from "../types";

export async function sections(query: ListingListQuery = {}): Promise<ListingSections> {
    await delay();

    let filtered = searchBy(MOCK_LISTINGS, query.search, [
        "unitName",
        "projectName",
        "location",
    ]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((listing) => listing.status === query.status);
    }

    // Most-viewed first inside each section — the ordering the grid implies.
    const byViews = [...filtered].sort((a, b) => b.views - a.views);

    return {
        sale: byViews.filter((listing) => listing.dealType === "sale"),
        rent: byViews.filter((listing) => listing.dealType === "rent"),
        total: byViews.length,
    };
}
