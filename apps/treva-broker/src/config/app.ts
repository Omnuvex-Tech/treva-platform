/**
 * Runtime configuration, read once from NEXT_PUBLIC_* env vars.
 *
 * Everything is read through a literal `process.env.NEXT_PUBLIC_*` reference on
 * purpose: Next inlines these at build time only when they appear literally, so
 * reading them behind a dynamic key would silently yield undefined in the
 * browser bundle.
 */
export const appConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || "TREVA Broker",
    description: "TREVA real estate CRM for brokers, top brokers, and administrators",
} as const;

export const apiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_BROKER_API_URL || "http://localhost:10041/api/v1",
    timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 30_000),
    /**
     * While this is on, every feature resolves through its `*.mock.ts` adapter
     * and no network request is made. Flip to "0" in .env.development the day
     * the NestJS API is reachable — no component changes required.
     */
    useMock: (process.env.NEXT_PUBLIC_USE_MOCK ?? "1") === "1",
    /**
     * Auth only, overriding `useMock`: sign-in and sign-up talk to
     * treva-broker-api while every other feature still reads its fixtures.
     * Falls back to `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockAuth:
        (process.env.NEXT_PUBLIC_USE_MOCK_AUTH ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") === "1",
    /**
     * News Feed only, overriding `useMock` the same way: the feed, the editor
     * and its uploads talk to treva-broker-api. Falls back to
     * `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockNews:
        (process.env.NEXT_PUBLIC_USE_MOCK_NEWS ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") === "1",
    /**
     * Clients only, overriding `useMock` the same way: the list, the lead form,
     * edit and delete talk to treva-broker-api. Falls back to
     * `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockClients:
        (process.env.NEXT_PUBLIC_USE_MOCK_CLIENTS ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") === "1",
    /**
     * Broker Role only, overriding `useMock` the same way: the materials
     * library, its uploads, the edit screen and delete talk to
     * treva-broker-api. Falls back to `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockBrokerRole:
        (process.env.NEXT_PUBLIC_USE_MOCK_BROKER_ROLE ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") ===
        "1",
    /**
     * Floor Plan only, overriding `useMock` the same way: Listings and a
     * building's floor plan read the inventory Synchronize copied into
     * treva-broker-api. Falls back to `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockFloorPlan:
        (process.env.NEXT_PUBLIC_USE_MOCK_FLOOR_PLAN ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") ===
        "1",
    /**
     * Projects only, overriding `useMock` the same way: the grid, the project
     * screen, the editor with its image uploads, and delete talk to
     * treva-broker-api. Falls back to `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockProjects:
        (process.env.NEXT_PUBLIC_USE_MOCK_PROJECTS ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") ===
        "1",
    /**
     * The Admin Panel's Users screen only, overriding `useMock` the same way:
     * both tabs — platform users and real-estate agencies — the agent editor,
     * Profile and delete talk to treva-broker-api. Falls back to
     * `NEXT_PUBLIC_USE_MOCK` when unset.
     */
    useMockUsers:
        (process.env.NEXT_PUBLIC_USE_MOCK_USERS ?? process.env.NEXT_PUBLIC_USE_MOCK ?? "1") === "1",
} as const;
