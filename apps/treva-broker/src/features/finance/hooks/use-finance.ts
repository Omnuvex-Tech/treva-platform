"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { financeService } from "../api/finance.service";

export function useFinanceSummary() {
    return useQuery({
        queryKey: queryKeys.finance.summary,
        queryFn: () => financeService.summary(),
    });
}

export function useSales() {
    return useQuery({
        queryKey: queryKeys.finance.sales,
        queryFn: () => financeService.sales(),
    });
}

export function useLeaderboard() {
    return useQuery({
        queryKey: queryKeys.finance.leaderboard,
        queryFn: () => financeService.leaderboard(),
    });
}
