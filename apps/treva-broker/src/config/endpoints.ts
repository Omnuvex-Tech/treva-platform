/**
 * Paths on the NestJS broker API, relative to NEXT_PUBLIC_BROKER_API_URL.
 * Listed here (not inlined in services) so the contract with the backend is
 * reviewable in one file.
 */
export const endpoints = {
    auth: {
        login: "/auth/login",
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
    finance: {
        summary: "/finance/summary",
        transactions: "/finance/transactions",
    },
    projects: {
        list: "/projects",
        detail: (id: string) => `/projects/${id}`,
    },
    floorPlan: {
        buildings: "/floor-plan/buildings",
        floors: (buildingId: string) => `/floor-plan/buildings/${buildingId}/floors`,
    },
    users: {
        list: "/users",
        detail: (id: string) => `/users/${id}`,
    },
} as const;
