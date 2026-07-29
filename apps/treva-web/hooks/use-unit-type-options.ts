"use client";

import { useQuery } from "@tanstack/react-query";
import { trevaApi as api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface UnitTypeOption {
    id: string;
    name: string;
    title: string;
    order: number;
}

export function useUnitTypeOptions() {
    return useQuery({
        queryKey: ["unit-type-options"],
        queryFn: async () => {
            const response = await api.get<UnitTypeOption[]>(endpoints.unitTypeOptions.list);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
