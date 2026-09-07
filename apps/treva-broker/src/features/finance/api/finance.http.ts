import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { FinanceSummary, LeaderboardRow, SaleRow } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function summary(): Promise<FinanceSummary> {
    return http.get<FinanceSummary>(endpoints.finance.summary);
}

export async function sales(): Promise<SaleRow[]> {
    return http.get<SaleRow[]>(endpoints.finance.sales);
}

export async function leaderboard(): Promise<LeaderboardRow[]> {
    return http.get<LeaderboardRow[]>(endpoints.finance.leaderboard);
}
