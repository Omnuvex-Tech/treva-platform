import apiClient from "./client";

export interface ProfitbaseSyncCounters {
    created: number;
    updated: number;
    // Edited or deleted in the inventory, so left alone.
    skipped: number;
}

export interface ProfitbaseSyncSummary {
    categories: ProfitbaseSyncCounters;
    houses: ProfitbaseSyncCounters;
    unitLayouts: ProfitbaseSyncCounters;
}

export const profitbaseApi = {
    sync: () => apiClient.post<ProfitbaseSyncSummary>("/profitbase/sync"),
};
