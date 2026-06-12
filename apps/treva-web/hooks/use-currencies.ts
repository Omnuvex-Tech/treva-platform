"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Currency {
    id: string;
    name: string;
    value: string;
    order: number;
}

export function useCurrencies() {
    return useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const response = await api.get<Currency[]>("/currencies");
            return response.data;
        },
    });
}
