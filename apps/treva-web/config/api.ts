import { normalizer } from "@repo/shared/utils";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
}

export const api = {
  url: apiBaseUrl,
  timeout: normalizer.number(process.env.NEXT_PUBLIC_API_TIMEOUT, 30000),
} as const;
