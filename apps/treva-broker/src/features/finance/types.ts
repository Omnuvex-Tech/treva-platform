/**
 * Finance — the broker's own performance, not a company ledger (1173:17952).
 *
 * The artboard is four KPI tiles, a six-month trend, revenue split by project,
 * the broker's own sales, and the standing of every broker. An earlier build
 * modelled this as a transaction ledger with status tabs; the file draws no
 * status anywhere, so those types are gone rather than left to rot.
 */
export interface FinanceSummary {
    /** Commission earned in the period — the first tile. */
    totalCommission: number;
    /** Percentage change against the previous month. */
    commissionDelta: number;
    dealsClosed: number;
    /** A count, not a percentage: the tile reads "+4 vs last month". */
    dealsClosedDelta: number;
    salesVolume: number;
    salesVolumeDelta: number;
    /** Standing among all brokers — the tile reads "#3". */
    rank: number;
    /** The percentile that standing falls in — "Top 15% of brokers". */
    rankPercentile: number;
    /** Sales Trend — six months, oldest first. */
    trend: { label: string; value: number }[];
    /** Revenue by Project — the horizontal bars, largest first. */
    revenueByProject: { label: string; value: number }[];
}

/** One row of the sales table (1173:18088). */
export interface SaleRow {
    id: string;
    projectName: string;
    /**
     * The block within the project. Not a column in the table — it exists
     * because the request modal titles itself with the sale's full identity,
     * "Project name , Building name, Unity name, Sales Date" (1173:18650).
     */
    buildingName: string;
    /** The unit sold, as the artboard writes it: "A 23 - 02". */
    unit: string;
    listingPrice: number;
    salesPrice: number;
    /**
     * The total due on the sale — the artboard's column is "Receivable", the
     * amount to collect, not the amount collected. `paid` is what has come in
     * against it and `remaining` is the balance, so the three always satisfy
     * `receivable = paid + remaining`.
     */
    receivable: number;
    paid: number;
    remaining: number;
    salesDate: string;
    /** Down payment and term, shown on the request modal but not in the table. */
    downPayment: number;
    creditTerm: string;
    /**
     * How long the payment plan stands. The modal shows it as a pill where the
     * Last Payment Date field would otherwise take input (1173:18675), because
     * the date is the plan's, not the broker's to type.
     */
    approvedUntil: string;
}

/** One row of All Broker Leaderboard (1173:18174). */
export interface LeaderboardRow {
    id: string;
    name: string;
    deals: number;
    commission: number;
    /**
     * Which way the arrow beside the commission points. It is the broker's own
     * movement since last month, which is why the figure can be inked red on a
     * row that is still near the top.
     */
    trend: "up" | "down";
}
