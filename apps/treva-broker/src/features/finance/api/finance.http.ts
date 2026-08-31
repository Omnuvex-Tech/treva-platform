import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { FinanceSummary, Transaction, TransactionQuery } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function summary(brokerId?: string): Promise<FinanceSummary> {
    return http.get<FinanceSummary>(endpoints.finance.summary, { params: { brokerId } });
}

export async function transactions(
    query: TransactionQuery = {},
): Promise<Paginated<Transaction>> {
    return http.get<Paginated<Transaction>>(endpoints.finance.transactions, {
        params: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
            brokerId: query.brokerId,
        },
    });
}
