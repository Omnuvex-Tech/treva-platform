"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface StatusOption {
    id: string;
    value: string;
    order: number;
}

export function useStatusOptions() {
    return useQuery({
        queryKey: ["status-options"],
        queryFn: async () => {
            const response = await api.get<StatusOption[]>(endpoints.statusOptions.list);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
