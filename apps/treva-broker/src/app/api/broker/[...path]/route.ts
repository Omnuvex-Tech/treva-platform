import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { config } from "@/config";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session-cookie";

/**
 * The browser's way to treva-broker-api.
 *
 * The API wants a bearer token, and the token lives in the httpOnly session
 * cookie where no script can read it. So client-side calls (`lib/api/http.ts`
 * in the browser) land here, and this handler forwards them with the token
 * attached — method, query string and body untouched, the API's status and
 * body passed straight back.
 *
 * Deliberately not a general proxy: the target is always under the configured
 * API base, and `proxy.ts` leaves `/api` alone, so there is no locale redirect.
 */
async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;

    // Encoded per segment, and no dot segments, so a path cannot climb out of
    // the API base.
    if (path.some((segment) => segment === "." || segment === "..")) {
        return Response.json({ statusCode: 400, code: "bad_path", message: "Invalid path" }, { status: 400 });
    }

    const base = config.api.baseUrl.endsWith("/") ? config.api.baseUrl : `${config.api.baseUrl}/`;
    const target = new URL(path.map(encodeURIComponent).join("/"), base);
    target.search = request.nextUrl.search;

    const store = await cookies();
    const session = decodeSession(store.get(SESSION_COOKIE)?.value);

    const headers = new Headers({ Accept: request.headers.get("accept") ?? "application/json" });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);

    const hasBody = request.method !== "GET" && request.method !== "HEAD";

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method: request.method,
            headers,
            body: hasBody ? await request.arrayBuffer() : undefined,
            cache: "no-store",
        });
    } catch {
        return Response.json(
            { statusCode: 502, code: "network_error", message: "The API could not be reached" },
            { status: 502 },
        );
    }

    const responseHeaders = new Headers();
    for (const name of ["content-type", "content-disposition"]) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.status === 204 ? null : upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
