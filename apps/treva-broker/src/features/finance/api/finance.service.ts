import { config } from "@/config";
import type { FinanceSummary, LeaderboardRow, SaleRow } from "../types";

import * as httpAdapter from "./finance.http";
import * as mockAdapter from "./finance.mock";

/**
 * None of these take a broker id.
 *
 * The artboard is one broker's own page — their commission, their rank, their
 * sales — so the scope is the authenticated session, which is the server's to
 * read and not the client's to ask for. The leaderboard is the one view that is
 * everyone's, and it is the same list for every caller.
 */
export interface FinanceService {
    summary(): Promise<FinanceSummary>;
    sales(): Promise<SaleRow[]>;
    leaderboard(): Promise<LeaderboardRow[]>;
}

export const financeService: FinanceService = config.api.useMock ? mockAdapter : httpAdapter;
