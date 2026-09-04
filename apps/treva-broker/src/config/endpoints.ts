/**
 * Paths on the NestJS broker API, relative to NEXT_PUBLIC_BROKER_API_URL.
 * Listed here (not inlined in services) so the contract with the backend is
 * reviewable in one file.
 */
export const endpoints = {
    auth: {
        login: "/auth/login",
        register: "/auth/register",
        logout: "/auth/logout",
        me: "/auth/me",
        forgotPassword: "/auth/forgot-password",
        resetPassword: "/auth/reset-password",
    },
    news: {
        list: "/news",
        detail: (id: string) => `/news/${id}`,
        stats: "/news/stats",
    },
    clients: {
        list: "/clients",
        detail: (id: string) => `/clients/${id}`,
    },
    brokers: {
        list: "/brokers",
        detail: (id: string) => `/brokers/${id}`,
    },
    /**
     * The Broker Role screen is the shared marketing-materials library — see the
     * note in features/brokers/types.ts for why the name and the content differ.
     */
    brokerRole: {
        documents: "/broker-role/documents",
        document: (id: string) => `/broker-role/documents/${id}`,
        download: (id: string) => `/broker-role/documents/${id}/download`,
    },
    finance: {
        summary: "/finance/summary",
        sales: "/finance/sales",
        leaderboard: "/finance/leaderboard",
    },
    projects: {
        list: "/projects",
        detail: (id: string) => `/projects/${id}`,
    },
    floorPlan: {
        buildings: "/floor-plan/buildings",
        floors: (buildingId: string) => `/floor-plan/buildings/${buildingId}/floors`,
    },
    listings: {
        sections: "/listings/sections",
        list: "/listings",
    },
    agencies: {
        list: "/agencies",
        detail: (id: string) => `/agencies/${id}`,
    },
    users: {
        list: "/users",
        detail: (id: string) => `/users/${id}`,
        /** The agency row under the agent editor (873:48887). */
        agencyLink: (id: string) => `/users/${id}/agency`,
    },
} as const;
