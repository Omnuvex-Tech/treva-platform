import { config } from "@/config";
import { ApiError } from "./errors";

interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    /** Query string params; `undefined` and `null` values are dropped. */
    params?: Record<string, string | number | boolean | undefined | null>;
    /** Overrides the default timeout for a single call. */
    timeoutMs?: number;
}

/**
 * Where the browser sends API calls: this app's own route handler
 * (src/app/api/broker/[...path]/route.ts), which adds the bearer token from the
 * httpOnly session cookie — script can never read that cookie itself.
 */
export const BROWSER_API_BASE = "/api/broker";

type AccessTokenResolver = () => Promise<string | null | undefined>;

let resolveServerAccessToken: AccessTokenResolver | null = null;

/**
 * On the server a request goes straight to the API, so it needs the token
 * itself. lib/auth/session.ts registers this — it is server-only, and this
 * module is shared with the browser, so it cannot import the cookie store.
 * Every guarded page loads session.ts through its `requirePermission` call.
 */
export function setServerAccessTokenResolver(resolver: AccessTokenResolver) {
    resolveServerAccessToken = resolver;
}

async function authorizationFor(headers: HeadersInit | undefined): Promise<Record<string, string>> {
    if (typeof window !== "undefined" || !resolveServerAccessToken) return {};
    if (new Headers(headers).has("Authorization")) return {};

    // Outside a request (a build step) there is no cookie store; go anonymous.
    const token = await resolveServerAccessToken().catch(() => null);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Thin fetch wrapper for the NestJS API.
 *
 * Kept intentionally small — no interceptor stack, no axios. Everything the app
 * needs is: absolute URL building, JSON in/out (or multipart for uploads), a
 * timeout, the session's token, and errors that are always `ApiError` so
 * callers never have to distinguish "the network failed" from "the server
 * said no".
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, timeoutMs = config.api.timeoutMs, headers, ...init } = options;

    const baseUrl =
        typeof window === "undefined"
            ? config.api.baseUrl
            : `${window.location.origin}${BROWSER_API_BASE}`;

    const url = new URL(
        path.startsWith("/") ? path.slice(1) : path,
        baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    );

    // A FormData body is sent as is: fetch writes the multipart boundary itself.
    const multipart = body instanceof FormData;
    const authorization = await authorizationFor(headers);

    for (const [key, value] of Object.entries(params ?? {})) {
        if (value === undefined || value === null || value === "") continue;
        url.searchParams.set(key, String(value));
    }

    // AbortSignal.timeout rather than a manual setTimeout + clearTimeout dance:
    // it cannot leak a timer when the request settles first.
    const signal = init.signal ?? AbortSignal.timeout(timeoutMs);

    let response: Response;

    try {
        response = await fetch(url, {
            ...init,
            signal,
            headers: {
                Accept: "application/json",
                ...(body === undefined || multipart ? {} : { "Content-Type": "application/json" }),
                ...authorization,
                ...headers,
            },
            body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "TimeoutError") {
            throw new ApiError(`Request to ${path} timed out`, 408, "timeout");
        }
        throw new ApiError(
            error instanceof Error ? error.message : "Network request failed",
            0,
            "network_error",
            error,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const problem = (payload ?? {}) as { message?: string; code?: string };
        throw new ApiError(
            problem.message ?? response.statusText ?? "Request failed",
            response.status,
            problem.code ?? "http_error",
            payload,
        );
    }

    return payload as T;
}

export const http = {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, { ...options, method: "POST", body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, { ...options, method: "PATCH", body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, { ...options, method: "PUT", body }),
    delete: <T>(path: string, options?: RequestOptions) =>
        request<T>(path, { ...options, method: "DELETE" }),
};
