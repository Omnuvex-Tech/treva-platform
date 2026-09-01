import { EMPTY_VISIBILITY, type NewsPost, type NewsStats } from "@/features/news/types";

/**
 * Fixtures for the News Feed screen, written to mirror the copy in the Figma
 * artboards so a side-by-side review is meaningful.
 *
 * Dates are relative to "now" rather than hard-coded, otherwise every card
 * reads as months stale a week after this file is written.
 */
function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(9, 0, 0, 0);
    return date.toISOString();
}

/**
 * Fields every fixture shares. Spelled once so each post below only states
 * what makes it different.
 */
const PUBLISHED: Pick<NewsPost, "status" | "attachments" | "visibility" | "expiresAt"> = {
    status: "published",
    attachments: [],
    visibility: EMPTY_VISIBILITY,
    expiresAt: "",
};

export const MOCK_NEWS: NewsPost[] = [
    {
        id: "news_1",
        title: "New Project: Pearl Towers Launched",
        excerpt:
            "Pearl Towers is now live in the system with 248 units across 25 floors. Pricing and availability are open for reservations.",
        body: "Pearl Towers is now live in the system with 248 units across 25 floors. Pricing and availability are open for reservations from today. Brokers can start assigning units to clients immediately.",
        category: "news",
        coverImageUrl: null,
        publishedAt: daysAgo(1),
        pinned: false,
        authorName: "Nigar Aliyeva",
        ...PUBLISHED,
        publishAt: daysAgo(1),
    },
    {
        id: "news_2",
        title: "Q2 Commission Structure Update",
        excerpt:
            "The commission tiers for Q2 have been revised. Top brokers now unlock the highest tier at 12 closed deals instead of 15.",
        body: "The commission tiers for Q2 have been revised. Top brokers now unlock the highest tier at 12 closed deals instead of 15. The change applies to all deals closed from the start of the quarter.",
        category: "announcement",
        coverImageUrl:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        publishedAt: daysAgo(2),
        pinned: true,
        authorName: "Nigar Aliyeva",
        ...PUBLISHED,
        attachments: [
            {
                id: "att_q2_1",
                name: "Q2 Commission Structure.pdf",
                sizeBytes: 1.2 * 1024 * 1024,
                kind: "pdf",
            },
            {
                id: "att_q2_2",
                name: "Tier Calculation Sheet.xlsx",
                sizeBytes: 0.3 * 1024 * 1024,
                kind: "sheet",
            },
        ],
        publishAt: daysAgo(2),
    },
    {
        id: "news_3",
        title: "Seaside Residence: Phase 2 Availability",
        excerpt:
            "Phase 2 of Seaside Residence opens with 96 units. Sea-view apartments on floors 12 and above are released in limited batches.",
        body: "Phase 2 of Seaside Residence opens with 96 units. Sea-view apartments on floors 12 and above are released in limited batches to keep pricing stable.",
        category: "news",
        coverImageUrl: null,
        publishedAt: daysAgo(3),
        pinned: false,
        authorName: "Rashad Guliyev",
        ...PUBLISHED,
        publishAt: daysAgo(3),
    },
    {
        id: "news_4",
        title: "Client Handover Process Changes",
        excerpt:
            "Handover documents now go through the platform. Paper forms will stop being accepted at the end of the month.",
        body: "Handover documents now go through the platform. Paper forms will stop being accepted at the end of the month — upload scans under the client record instead.",
        category: "announcement",
        coverImageUrl:
            "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
        publishedAt: daysAgo(4),
        pinned: false,
        authorName: "Nigar Aliyeva",
        ...PUBLISHED,
        publishAt: daysAgo(4),
    },
    {
        id: "news_5",
        title: "Marina View: Floor Plans Updated",
        excerpt:
            "Updated floor plans for Marina View are available. Unit 4B through 4F changed layout after the developer revision.",
        body: "Updated floor plans for Marina View are available in the Floor Plan section. Units 4B through 4F changed layout after the developer revision — re-share the plans with any client holding an older version.",
        category: "news",
        coverImageUrl:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
        publishedAt: daysAgo(6),
        pinned: false,
        authorName: "Rashad Guliyev",
        ...PUBLISHED,
        publishAt: daysAgo(6),
    },
    {
        id: "news_6",
        title: "Monthly Sales Review — Results",
        excerpt:
            "The team closed 34 deals this month, 18% above target. Full breakdown by broker is available in the Finance section.",
        body: "The team closed 34 deals this month, 18% above target. Full breakdown by broker is available in the Finance section.",
        category: "announcement",
        coverImageUrl:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        publishedAt: daysAgo(8),
        pinned: false,
        authorName: "Rashad Guliyev",
        ...PUBLISHED,
        publishAt: daysAgo(8),
    },
    {
        id: "news_7",
        title: "New Developer Partnership Signed",
        excerpt:
            "A partnership with Caspian Development adds four upcoming projects to the platform over the next two quarters.",
        body: "A partnership with Caspian Development adds four upcoming projects to the platform over the next two quarters. Details will follow per project.",
        category: "news",
        coverImageUrl: null,
        publishedAt: daysAgo(11),
        pinned: false,
        authorName: "Nigar Aliyeva",
        ...PUBLISHED,
        publishAt: daysAgo(11),
    },
    {
        id: "news_8",
        title: "Platform Maintenance Window",
        excerpt:
            "Scheduled maintenance this Sunday between 02:00 and 05:00. The platform will be read-only during that window.",
        body: "Scheduled maintenance this Sunday between 02:00 and 05:00. The platform will be read-only during that window — plan client-facing work around it.",
        category: "announcement",
        coverImageUrl: null,
        publishedAt: daysAgo(14),
        pinned: false,
        authorName: "Nigar Aliyeva",
        ...PUBLISHED,
        publishAt: daysAgo(14),
    },
];

export const MOCK_NEWS_STATS: NewsStats = {
    postsThisWeek: 12,
    unread: 4,
    newToday: 2,
};
