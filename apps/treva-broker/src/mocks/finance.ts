import type { FinanceSummary, Transaction } from "@/features/finance/types";

function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

/** Last 12 month labels, oldest first, ending with the current month. */
function lastTwelveMonths(): string[] {
    const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
    const months: string[] = [];

    for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - offset);
        months.push(formatter.format(date));
    }

    return months;
}

const MONTHLY_VALUES = [
    18_400, 21_900, 17_600, 24_300, 28_100, 26_700, 31_200, 29_800, 34_500, 32_100, 38_900, 41_200,
];

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
    totalCommission: 344_700,
    commissionDelta: 12.4,
    pendingPayout: 58_300,
    pendingDelta: -4.2,
    closedDeals: 34,
    closedDealsDelta: 18.0,
    averageDealValue: 289_400,
    averageDealDelta: 3.1,
    monthly: lastTwelveMonths().map((label, index) => ({
        label,
        value: MONTHLY_VALUES[index]!,
    })),
    // Order matches the chart token order: green, blue, amber, red.
    byStatus: [
        { label: "Paid", value: 214_600 },
        { label: "Processing", value: 71_800 },
        { label: "Pending", value: 46_100 },
        { label: "Cancelled", value: 12_200 },
    ],
};

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "tr_1",
        reference: "TRV-2451",
        clientName: "Emin Aliyev",
        projectName: "Pearl Towers",
        brokerId: "usr_broker_1",
        brokerName: "Leyla Hasanova",
        amount: 320_000,
        commission: 9_600,
        status: "processing",
        date: daysAgo(2),
    },
    {
        id: "tr_2",
        reference: "TRV-2448",
        clientName: "Rauf Baghirov",
        projectName: "Seaside Residence",
        brokerId: "usr_broker_2",
        brokerName: "Kamran Mammadov",
        amount: 540_000,
        commission: 16_200,
        status: "paid",
        date: daysAgo(6),
    },
    {
        id: "tr_3",
        reference: "TRV-2440",
        clientName: "Aygun Nasirova",
        projectName: "Marina View",
        brokerId: "usr_broker_4",
        brokerName: "Gunel Ismayilova",
        amount: 240_000,
        commission: 7_200,
        status: "paid",
        date: daysAgo(11),
    },
    {
        id: "tr_4",
        reference: "TRV-2437",
        clientName: "Vusal Ahmadov",
        projectName: "Pearl Towers",
        brokerId: "usr_top_broker_1",
        brokerName: "Rashad Guliyev",
        amount: 410_000,
        commission: 12_300,
        status: "pending",
        date: daysAgo(14),
    },
    {
        id: "tr_5",
        reference: "TRV-2429",
        clientName: "Ilkin Suleymanov",
        projectName: "Seaside Residence",
        brokerId: "usr_broker_1",
        brokerName: "Leyla Hasanova",
        amount: 275_000,
        commission: 8_250,
        status: "processing",
        date: daysAgo(19),
    },
    {
        id: "tr_6",
        reference: "TRV-2418",
        clientName: "Zeynab Karimova",
        projectName: "Marina View",
        brokerId: "usr_broker_2",
        brokerName: "Kamran Mammadov",
        amount: 210_000,
        commission: 6_300,
        status: "paid",
        date: daysAgo(26),
    },
    {
        id: "tr_7",
        reference: "TRV-2411",
        clientName: "Anar Jafarov",
        projectName: "Seaside Residence",
        brokerId: "usr_top_broker_1",
        brokerName: "Rashad Guliyev",
        amount: 620_000,
        commission: 18_600,
        status: "pending",
        date: daysAgo(31),
    },
    {
        id: "tr_8",
        reference: "TRV-2404",
        clientName: "Nurana Qasimova",
        projectName: "Marina View",
        brokerId: "usr_broker_2",
        brokerName: "Kamran Mammadov",
        amount: 150_000,
        commission: 4_500,
        status: "cancelled",
        date: daysAgo(38),
    },
    {
        id: "tr_9",
        reference: "TRV-2396",
        clientName: "Lala Huseynli",
        projectName: "Pearl Towers",
        brokerId: "usr_broker_4",
        brokerName: "Gunel Ismayilova",
        amount: 199_000,
        commission: 5_970,
        status: "paid",
        date: daysAgo(44),
    },
    {
        id: "tr_10",
        reference: "TRV-2388",
        clientName: "Murad Eyvazov",
        projectName: "Marina View",
        brokerId: "usr_broker_1",
        brokerName: "Leyla Hasanova",
        amount: 355_000,
        commission: 10_650,
        status: "paid",
        date: daysAgo(51),
    },
    {
        id: "tr_11",
        reference: "TRV-2379",
        clientName: "Ulviyya Salimova",
        projectName: "Pearl Towers",
        brokerId: "usr_broker_4",
        brokerName: "Gunel Ismayilova",
        amount: 168_000,
        commission: 5_040,
        status: "processing",
        date: daysAgo(58),
    },
    {
        id: "tr_12",
        reference: "TRV-2370",
        clientName: "Sevinj Mammadova",
        projectName: "Marina View",
        brokerId: "usr_broker_1",
        brokerName: "Leyla Hasanova",
        amount: 185_000,
        commission: 5_550,
        status: "paid",
        date: daysAgo(64),
    },
];
