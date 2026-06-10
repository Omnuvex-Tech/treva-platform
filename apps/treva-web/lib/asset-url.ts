import { config } from "@/config";

export function getAssetUrl(url: string | undefined) {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/.test(url)) return url;

    const apiOrigin = new URL(config.api.url).origin;
    return new URL(url, apiOrigin).toString();
}
