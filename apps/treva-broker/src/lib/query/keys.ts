import type { PageQuery } from "@/lib/api/types";

/**
 * Central query-key factory.
 *
 * Keys built ad hoc at call sites are the usual reason a mutation invalidates
 * nothing: `["news"]` in one file and `["news", {}]` in another do not match.
 * Every key in the app is produced here, so `queryClient.invalidateQueries({
 * queryKey: queryKeys.news.all })` reliably covers every news query.
 */
export const queryKeys = {
    session: ["session"] as const,

    news: {
        all: ["news"] as const,
        list: (query: PageQuery) => ["news", "list", query] as const,
        detail: (id: string) => ["news", "detail", id] as const,
        stats: ["news", "stats"] as const,
    },

    clients: {
        all: ["clients"] as const,
        list: (query: PageQuery) => ["clients", "list", query] as const,
        detail: (id: string) => ["clients", "detail", id] as const,
    },

    brokers: {
        all: ["brokers"] as const,
        list: (query: PageQuery) => ["brokers", "list", query] as const,
        detail: (id: string) => ["brokers", "detail", id] as const,
    },

    finance: {
        all: ["finance"] as const,
        summary: ["finance", "summary"] as const,
        sales: ["finance", "sales"] as const,
        leaderboard: ["finance", "leaderboard"] as const,
    },

    projects: {
        all: ["projects"] as const,
        list: (query: PageQuery) => ["projects", "list", query] as const,
        detail: (id: string) => ["projects", "detail", id] as const,
    },

    floorPlan: {
        all: ["floor-plan"] as const,
        buildings: ["floor-plan", "buildings"] as const,
        floors: (buildingId: string) => ["floor-plan", "floors", buildingId] as const,
    },

    users: {
        all: ["users"] as const,
        list: (query: PageQuery) => ["users", "list", query] as const,
        detail: (id: string) => ["users", "detail", id] as const,
    },
} as const;
