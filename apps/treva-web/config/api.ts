import { normalizer } from "@repo/shared/utils";

export const api = {
    url: normalizer.string(process.env.NEXT_PUBLIC_API_URL, "https://api.treva.realestate"),
    timeout: normalizer.number(process.env.NEXT_PUBLIC_API_TIMEOUT, 30000),
} as const;
