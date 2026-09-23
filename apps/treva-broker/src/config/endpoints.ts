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
        read: (id: string) => `/news/${id}/read`,
        pinned: "/news/pinned",
        stats: "/news/stats",
    },
    /** Multipart, one `file` per request; answers with the stored file's URL. */
    uploads: "/uploads",
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
        /** Multipart, one `file`; the editor's image wells. */
        images: "/projects/images",
        /** Multipart, one `file`; a Key Highlights row's own icon. */
        icons: "/projects/icons",
        /** Multipart, one `file`; a Marketing Materials row's file. */
        materials: "/projects/materials",
        materialDownload: (id: string, materialId: string) =>
            `/projects/${id}/materials/${materialId}/download`,
        /** Copies treva-api's off-plan objects, buildings and units in. */
        sync: "/projects/sync",
    },
    floorPlan: {
        buildings: "/floor-plan/buildings",
        floors: (buildingId: string) => `/floor-plan/buildings/${buildingId}/floors`,
        /** `?page&perPage&sort` — the Layouts tab, paginated. */
        layouts: (buildingId: string) => `/floor-plan/buildings/${buildingId}/layouts`,
    },
    listings: {
        sections: "/listings/sections",
        list: "/listings",
    },
    agencies: {
        list: "/agencies",
        /** Accounts that belong to no agency — the Manager field's options. */
        managers: "/agencies/managers",
        detail: (id: string) => `/agencies/${id}`,
    },
    users: {
        list: "/users",
        detail: (id: string) => `/users/${id}`,
        /** The agency row under the agent editor (873:48887). */
        agencyLink: (id: string) => `/users/${id}/agency`,
    },
} as const;
