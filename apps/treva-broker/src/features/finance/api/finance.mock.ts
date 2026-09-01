import { delay, paginate, searchBy } from "@/lib/api/mock";
import type { Paginated } from "@/lib/api/types";
import { MOCK_FINANCE_SUMMARY, MOCK_TRANSACTIONS } from "@/mocks/finance";
import type { FinanceSummary, Transaction, TransactionQuery } from "../types";

export async function summary(brokerId?: string): Promise<FinanceSummary> {
    await delay(260);

    if (!brokerId) return MOCK_FINANCE_SUMMARY;

    // A broker sees their own book. Rather than keeping a second fixture in
    // sync, the personal view is derived from that broker's transactions, so
    // the tiles and the table can never disagree.
    const own = MOCK_TRANSACTIONS.filter((entry) => entry.brokerId === brokerId);
    const totalCommission = own.reduce((sum, entry) => sum + entry.commission, 0);
    const pendingPayout = own
        .filter((entry) => entry.status === "pending" || entry.status === "processing")
        .reduce((sum, entry) => sum + entry.commission, 0);
    const closed = own.filter((entry) => entry.status === "paid");

    const byStatusOrder: Transaction["status"][] = ["paid", "processing", "pending", "cancelled"];
    const labels: Record<Transaction["status"], string> = {
        paid: "Paid",
        processing: "Processing",
        pending: "Pending",
        cancelled: "Cancelled",
    };

    return {
        ...MOCK_FINANCE_SUMMARY,
        totalCommission,
        pendingPayout,
        closedDeals: closed.length,
        averageDealValue: own.length
            ? Math.round(own.reduce((sum, entry) => sum + entry.amount, 0) / own.length)
            : 0,
        byStatus: byStatusOrder.map((status) => ({
            label: labels[status],
            value: own
                .filter((entry) => entry.status === status)
                .reduce((sum, entry) => sum + entry.commission, 0),
        })),
    };
}

export async function transactions(
    query: TransactionQuery = {},
): Promise<Paginated<Transaction>> {
    await delay();

    let filtered = searchBy(MOCK_TRANSACTIONS, query.search, [
        "reference",
        "clientName",
        "projectName",
        "brokerName",
    ]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((entry) => entry.status === query.status);
    }

    if (query.brokerId) {
        filtered = filtered.filter((entry) => entry.brokerId === query.brokerId);
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 8 });
}
