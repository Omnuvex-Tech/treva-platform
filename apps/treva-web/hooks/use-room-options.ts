"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface RoomOption {
    id: string;
    value: string;
    order: number;
}

export function useRoomOptions() {
    return useQuery({
        queryKey: ["room-options"],
        queryFn: async () => {
            const response = await api.get<RoomOption[]>(endpoints.roomOptions.list);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
