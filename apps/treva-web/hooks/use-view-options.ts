"use client";

import { useQuery } from "@tanstack/react-query";
import { trevaApi as api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface ViewOption {
    id: string;
    name?: string;
    title?: string;
    value?: string;
}

export function useViewOptions() {
    return useQuery({
        queryKey: ["view-options"],
        queryFn: async () => {
            const response = await api.get<ViewOption[]>(endpoints.viewOptions.list);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
