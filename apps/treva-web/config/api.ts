import { normalizer } from "@repo/shared/utils";

export const api = {
    url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1",
    timeout: normalizer.number(process.env.NEXT_PUBLIC_API_TIMEOUT, 30000),
} as const;
