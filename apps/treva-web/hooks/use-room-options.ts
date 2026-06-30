"use client";

import { useQuery } from "@tanstack/react-query";
import { trevaApi as api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";

export interface RoomOption {
    id: string;
    value: string;
    type: string;
    order: number;
}

export function useRoomOptions(type?: 'resale' | 'off-plan') {
    return useQuery({
        queryKey: ["room-options", type],
        queryFn: async () => {
            const url = type
                ? `${endpoints.roomOptions.list}?type=${type}`
                : endpoints.roomOptions.list;
            const response = await api.get<RoomOption[]>(url);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
