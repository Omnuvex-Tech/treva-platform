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
} as const;
