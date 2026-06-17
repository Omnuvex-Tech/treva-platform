"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";
import type { ResaleApartment, ResaleApartmentListResponse, ResaleFilters } from "@/lib/resale.types";

export function useResaleApartments(filters?: ResaleFilters) {
    return useQuery({
        queryKey: ["resale-apartments", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== "" && value !== null) {
                        params.append(key, String(value));
                    }
                });
            }
            const response = await api.get<ResaleApartmentListResponse>(
                `${endpoints.resale.apartments.list}?${params.toString()}`
            );
            return response.data;
        },
    });
}

export function useResaleApartment(id: string | undefined) {
    return useQuery({
        queryKey: ["resale-apartment", id],
        queryFn: async () => {
            if (!id) throw new Error("ID is required");
            const response = await api.get<ResaleApartment>(
                endpoints.resale.apartments.detail(id)
            );
            return response.data;
        },
        enabled: !!id,
    });
}

export function useResaleApartmentBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: ["resale-apartment-slug", slug],
        queryFn: async () => {
            if (!slug) throw new Error("Slug is required");
            const response = await api.get<ResaleApartment>(
                endpoints.resale.apartments.bySlug(slug)
            );
            return response.data;
        },
        enabled: !!slug,
    });
}

export function useResaleApartmentTypes() {
    return useQuery({
        queryKey: ["resale-apartment-types"],
        queryFn: async () => {
            const response = await api.get<any[]>(
                endpoints.resale.apartmentTypes.list
            );
            return response.data;
        },
    });
}

export function useResaleApartmentRange() {
    return useQuery({
        queryKey: ["resale-apartment-range"],
        queryFn: async () => {
            const response = await api.get<{ maxPrice: number; minPrice: number; maxTotalArea: number; minTotalArea: number }>(
                `${endpoints.resale.apartments.list}/range`
            );
            return response.data;
        },
    });
}
