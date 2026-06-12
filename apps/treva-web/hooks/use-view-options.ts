"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface ViewOption {
    id: string;
    value: string;
    order: number;
}

export function useViewOptions() {
    return useQuery({
        queryKey: ["view-options"],
        queryFn: async () => {
            const response = await api.get<ViewOption[]>(endpoints.viewOptions.list);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
