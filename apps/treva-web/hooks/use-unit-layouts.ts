"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
