import { normalizer } from "@repo/shared/utils";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
}

export const api = {
  url: apiBaseUrl,
  trevaUrl: trevaApiUrl || "http://localhost:10011/api/v1",
  timeout: normalizer.number(process.env.NEXT_PUBLIC_API_TIMEOUT, 30000),
} as const;
