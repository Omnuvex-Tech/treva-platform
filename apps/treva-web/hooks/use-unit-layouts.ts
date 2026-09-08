"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { trevaApi as api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";
import {
    UnitLayout,
    UnitLayoutListResponse,
    UnitLayoutFilters,
} from "@/lib/unit-layout.types";

export function useUnitLayouts(filters?: UnitLayoutFilters) {
    return useQuery({
        queryKey: ["unit-layouts", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== "" && value !== null) {
                        params.append(key, String(value));
                    }
                });
            }
            const response = await api.get<UnitLayoutListResponse>(
                `${endpoints.offPlan.list}?${params.toString()}`
            );
            return response.data;
        },
        // Keep the previous page/filter's results on screen while the next
        // request is in flight, so paginating ("show more") or tweaking a
        // filter dims the current list instead of blanking it to a spinner.
        placeholderData: keepPreviousData,
    });
}

export function useUnitLayout(id: string | undefined) {
    return useQuery({
        queryKey: ["unit-layout", id],
        queryFn: async () => {
            if (!id) throw new Error("ID is required");
            const response = await api.get<UnitLayout>(
                endpoints.offPlan.detail(id)
            );
            return response.data;
        },
        enabled: !!id,
    });
}

export function useUnitLayoutRange(currency: string = 'AZN') {
    return useQuery({
        queryKey: ["unit-layout-range", currency],
        queryFn: async () => {
            const response = await api.get<{ maxPrice: number; minPrice: number; maxTotalArea: number; minTotalArea: number }>(
                `${endpoints.offPlan.list}/range?currency=${currency}`
            );
            return response.data;
        },
    });
}

export function useUnitLayoutFloors() {
    return useQuery({
        queryKey: ["unit-layout-floors"],
        queryFn: async () => {
            const response = await api.get<number[]>(
                `${endpoints.offPlan.list}/floors`
            );
            return response.data;
        },
    });
}

export function useUnitLayoutBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: ["unit-layout-slug", slug],
        queryFn: async () => {
            if (!slug) throw new Error("Slug is required");
            const response = await api.get<UnitLayout>(
                `${endpoints.offPlan.list}/slug/${slug}`
            );
            return response.data;
        },
        enabled: !!slug,
    });
}
