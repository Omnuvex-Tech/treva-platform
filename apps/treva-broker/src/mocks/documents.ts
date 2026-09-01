import type { BrokerDocument } from "@/features/brokers/types";

function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(9, 30, 0, 0);
    return date.toISOString();
}

/**
 * The four files are the ones drawn in the artboard, sizes included — keeping
 * them identical makes a side-by-side review meaningful.
 */
export const MOCK_DOCUMENTS: BrokerDocument[] = [
    {
        id: "doc_1",
        name: "Project Brochure EN.pdf",
        kind: "pdf",
        sizeBytes: 2.1 * 1024 * 1024,
        downloads: 183,
        version: 12,
        uploadedBy: "Nigar Aliyeva",
        uploadedAt: daysAgo(140),
        updatedAt: daysAgo(3),
        visibility: "all",
        url: "",
    },
    {
        id: "doc_2",
        name: "Прайс-лист RU.pdf",
        kind: "pdf",
        sizeBytes: 1.4 * 1024 * 1024,
        downloads: 96,
        version: 7,
        uploadedBy: "Nigar Aliyeva",
        uploadedAt: daysAgo(120),
        updatedAt: daysAgo(9),
        visibility: "all",
        url: "",
    },
    {
        id: "doc_3",
        name: "Floor Plans.pdf",
        kind: "pdf",
        sizeBytes: 3.8 * 1024 * 1024,
        downloads: 241,
        version: 4,
        uploadedBy: "Rashad Guliyev",
        uploadedAt: daysAgo(88),
        updatedAt: daysAgo(21),
        visibility: "all",
        url: "",
    },
    {
        id: "doc_4",
        name: "Presentation Q2 2025.pptx",
        kind: "pptx",
        sizeBytes: 8.2 * 1024 * 1024,
        downloads: 58,
        version: 2,
        uploadedBy: "Nigar Aliyeva",
        uploadedAt: daysAgo(35),
        updatedAt: daysAgo(35),
        visibility: "top_broker",
        url: "",
    },
    {
        id: "doc_5",
        name: "Commission Policy 2025.docx",
        kind: "docx",
        sizeBytes: 0.4 * 1024 * 1024,
        downloads: 74,
        version: 3,
        uploadedBy: "Nigar Aliyeva",
        uploadedAt: daysAgo(60),
        updatedAt: daysAgo(12),
        visibility: "admin",
        url: "",
    },
    {
        id: "doc_6",
        name: "Handover Checklist.xlsx",
        kind: "xlsx",
        sizeBytes: 0.2 * 1024 * 1024,
        downloads: 129,
        version: 5,
        uploadedBy: "Rashad Guliyev",
        uploadedAt: daysAgo(50),
        updatedAt: daysAgo(6),
        visibility: "all",
        url: "",
    },
];
