"use client";

import { useQuery } from "@tanstack/react-query";

import { listingsService } from "../api/listings.service";
import type { ListingListQuery } from "../types";

export function useListingSections(query: ListingListQuery) {
    return useQuery({
        queryKey: ["listings", "sections", query],
        queryFn: () => listingsService.sections(query),
        placeholderData: (previous) => previous,
    });
}
