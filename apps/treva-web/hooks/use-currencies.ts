"use client";

import { useQuery } from "@tanstack/react-query";
import { STATIC_CURRENCIES } from "@/config/currencies";

export interface Currency {
    id: string;
    name: string;
    value: string;
    order: number;
}

export function useCurrencies() {
    return useQuery({
        queryKey: ["currencies"],
        queryFn: async () => STATIC_CURRENCIES as Currency[],
    });
}
