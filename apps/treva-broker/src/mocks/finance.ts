import type { FinanceSummary, LeaderboardRow, SaleRow } from "@/features/finance/types";

function monthsAgo(months: number, day: number): string {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - months);
    date.setDate(day);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

function monthsAhead(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

/** Six month labels, oldest first, ending with the current month. */
function lastSixMonths(): string[] {
    const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
    const months: string[] = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - offset);
        months.push(formatter.format(date));
    }

    return months;
}

/**
 * The shape the artboard's line draws — up, a deep dip in the third month,
 * then a climb past where it started (the six markers of 1173:18042).
 */
const TREND_VALUES = [28_400, 30_100, 16_900, 18_700, 28_600, 35_400];

/**
 * Bar lengths read off the artboard: the second is 73% of the first, the third
 * 54%, the fourth 33% (1173:18074 to 1173:18080).
 */
const REVENUE_BY_PROJECT: FinanceSummary["revenueByProject"] = [
    { label: "Brabus Island Baku", value: 600 },
    { label: "Sabah Towers", value: 440 },
    { label: "Panorama by ELIE SAAB", value: 325 },
    { label: "Reportage Heights", value: 195 },
];

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
    totalCommission: 47_250,
    commissionDelta: 12.4,
    dealsClosed: 23,
    dealsClosedDelta: 4,
    salesVolume: 4_820_000,
    salesVolumeDelta: 8.2,
    rank: 3,
    rankPercentile: 15,
    trend: lastSixMonths().map((label, index) => ({
        label,
        value: TREND_VALUES[index] ?? 0,
    })),
    revenueByProject: REVENUE_BY_PROJECT,
};

/**
 * The artboard fills every sales row with the same placeholder ("Test",
 * "Brabus Island" under each price). The columns it names are real, so the
 * fixture keeps the columns and puts values of the right kind under them —
 * shipping the designer's lorem ipsum would make the table unreadable and hide
 * the formatting the cells actually need.
 */
export const MOCK_SALES: SaleRow[] = [
    {
        id: "sale_1",
        projectName: "Brabus Island Baku",
        buildingName: "Tower B",
        unit: "A 23 - 02",
        listingPrice: 485_000,
        salesPrice: 468_000,
        receivable: 468_000,
        paid: 93_600,
        remaining: 374_400,
        salesDate: monthsAgo(0, 6),
        downPayment: 93_600,
        creditTerm: "36 months",
        approvedUntil: monthsAhead(14),
    },
    {
        id: "sale_2",
        projectName: "Sabah Towers",
        buildingName: "Tower A",
        unit: "B 11 - 07",
        listingPrice: 312_000,
        salesPrice: 305_000,
        receivable: 305_000,
        paid: 305_000,
        remaining: 0,
        salesDate: monthsAgo(0, 2),
        downPayment: 305_000,
        creditTerm: "Cash",
        approvedUntil: monthsAhead(2),
    },
    {
        id: "sale_3",
        projectName: "Panorama by ELIE SAAB",
        buildingName: "Block C",
        unit: "C 08 - 14",
        listingPrice: 720_000,
        salesPrice: 698_500,
        receivable: 698_500,
        paid: 139_700,
        remaining: 558_800,
        salesDate: monthsAgo(1, 24),
        downPayment: 139_700,
        creditTerm: "24 months",
        approvedUntil: monthsAhead(11),
    },
    {
        id: "sale_4",
        projectName: "Reportage Heights",
        buildingName: "Block A",
        unit: "A 05 - 09",
        listingPrice: 268_000,
        salesPrice: 268_000,
        receivable: 268_000,
        paid: 80_400,
        remaining: 187_600,
        salesDate: monthsAgo(1, 17),
        downPayment: 80_400,
        creditTerm: "48 months",
        approvedUntil: monthsAhead(6),
    },
    {
        id: "sale_5",
        projectName: "Brabus Island Baku",
        buildingName: "Tower D",
        unit: "D 17 - 01",
        listingPrice: 540_000,
        salesPrice: 512_000,
        receivable: 512_000,
        paid: 460_800,
        remaining: 51_200,
        salesDate: monthsAgo(2, 11),
        downPayment: 153_600,
        creditTerm: "12 months",
        approvedUntil: monthsAhead(3),
    },
    {
        id: "sale_6",
        projectName: "Sabah Towers",
        buildingName: "Tower A",
        unit: "B 04 - 12",
        listingPrice: 295_000,
        salesPrice: 289_000,
        receivable: 289_000,
        paid: 57_800,
        remaining: 231_200,
        salesDate: monthsAgo(2, 3),
        downPayment: 57_800,
        creditTerm: "60 months",
        approvedUntil: monthsAhead(9),
    },
    {
        id: "sale_7",
        projectName: "Panorama by ELIE SAAB",
        buildingName: "Block C",
        unit: "C 12 - 06",
        listingPrice: 655_000,
        salesPrice: 640_000,
        receivable: 640_000,
        paid: 192_000,
        remaining: 448_000,
        salesDate: monthsAgo(3, 21),
        downPayment: 192_000,
        creditTerm: "36 months",
        approvedUntil: monthsAhead(17),
    },
    {
        id: "sale_8",
        projectName: "Reportage Heights",
        buildingName: "Block B",
        unit: "A 09 - 03",
        listingPrice: 244_000,
        salesPrice: 238_500,
        receivable: 238_500,
        paid: 214_650,
        remaining: 23_850,
        salesDate: monthsAgo(3, 8),
        downPayment: 71_550,
        creditTerm: "24 months",
        approvedUntil: monthsAhead(4),
    },
];

/** The eight brokers the artboard ranks, commissions included (1173:18174). */
export const MOCK_LEADERBOARD: LeaderboardRow[] = [
    { id: "usr_1", name: "Nigar Həsənova", deals: 31, commission: 68_400, trend: "up" },
    { id: "usr_2", name: "Elvin Məmmədov", deals: 28, commission: 54_200, trend: "up" },
    { id: "usr_3", name: "Anar Rzayev", deals: 23, commission: 47_250, trend: "up" },
    { id: "usr_4", name: "Leyla Əliyeva", deals: 21, commission: 41_800, trend: "up" },
    { id: "usr_5", name: "Kamran Hüseynov", deals: 19, commission: 38_100, trend: "down" },
    { id: "usr_6", name: "Günel Babayeva", deals: 17, commission: 33_600, trend: "down" },
    { id: "usr_7", name: "Rauf İsmayılov", deals: 14, commission: 27_900, trend: "down" },
    { id: "usr_8", name: "Sevinc Quliyeva", deals: 12, commission: 24_100, trend: "down" },
];
