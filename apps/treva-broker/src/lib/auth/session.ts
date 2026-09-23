import "server-only";

import { cookies } from "next/headers";

import { setServerAccessTokenResolver } from "@/lib/api/http";
import type { Session } from "@/types/auth";
import { SESSION_COOKIE, decodeSession } from "./session-cookie";

/** Reads the current session in a Server Component, layout, or route handler. */
export async function getSession(): Promise<Session | null> {
    const store = await cookies();
    return decodeSession(store.get(SESSION_COOKIE)?.value);
}

// Server-side API calls (a page loading a post) carry the signed-in user's token.
setServerAccessTokenResolver(async () => (await getSession())?.accessToken);
