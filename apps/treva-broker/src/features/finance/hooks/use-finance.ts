"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { financeService } from "../api/finance.service";
import type { TransactionQuery } from "../types";

export function useFinanceSummary(brokerId?: string) {
    return useQuery({
        queryKey: [...queryKeys.finance.summary, brokerId ?? "all"],
        queryFn: () => financeService.summary(brokerId),
    });
}

export function useTransactions(query: TransactionQuery) {
    return useQuery({
        queryKey: queryKeys.finance.transactions(query),
        queryFn: () => financeService.transactions(query),
        placeholderData: (previous) => previous,
    });
}
