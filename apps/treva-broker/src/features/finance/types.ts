export type TransactionStatus = "paid" | "pending" | "processing" | "cancelled";

export interface FinanceSummary {
    /** Commission earned in the selected period. */
    totalCommission: number;
    commissionDelta: number;
    /** Commission that is approved but not yet paid out. */
    pendingPayout: number;
    pendingDelta: number;
    closedDeals: number;
    closedDealsDelta: number;
    averageDealValue: number;
    averageDealDelta: number;
    /** Month-by-month commission, oldest first — the line chart series. */
    monthly: { label: string; value: number }[];
    /** Commission split by deal state — the donut. */
    byStatus: { label: string; value: number }[];
}

export interface Transaction {
    id: string;
    reference: string;
    clientName: string;
    projectName: string;
    brokerId: string;
    brokerName: string;
    amount: number;
    commission: number;
    status: TransactionStatus;
    date: string;
}

export interface TransactionQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: TransactionStatus | "all";
    /** Scopes to one broker; omitted for roles with `finance:read_all`. */
    brokerId?: string;
}
