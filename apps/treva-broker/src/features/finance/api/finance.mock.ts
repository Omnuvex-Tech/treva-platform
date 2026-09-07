import { delay } from "@/lib/api/mock";
import { MOCK_FINANCE_SUMMARY, MOCK_LEADERBOARD, MOCK_SALES } from "@/mocks/finance";
import type { FinanceSummary, LeaderboardRow, SaleRow } from "../types";

export async function summary(): Promise<FinanceSummary> {
    await delay(260);
    return MOCK_FINANCE_SUMMARY;
}

export async function sales(): Promise<SaleRow[]> {
    await delay();

    return [...MOCK_SALES].sort(
        (a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime(),
    );
}

export async function leaderboard(): Promise<LeaderboardRow[]> {
    await delay();

    // Ranked by commission, which is what the artboard's № column counts off.
    return [...MOCK_LEADERBOARD].sort((a, b) => b.commission - a.commission);
}
