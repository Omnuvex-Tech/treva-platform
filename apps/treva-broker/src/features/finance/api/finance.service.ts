import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { FinanceSummary, Transaction, TransactionQuery } from "../types";

import * as httpAdapter from "./finance.http";
import * as mockAdapter from "./finance.mock";

export interface FinanceService {
    summary(brokerId?: string): Promise<FinanceSummary>;
    transactions(query?: TransactionQuery): Promise<Paginated<Transaction>>;
}

export const financeService: FinanceService = config.api.useMock ? mockAdapter : httpAdapter;
