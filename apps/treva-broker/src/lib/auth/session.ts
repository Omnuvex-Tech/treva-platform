import "server-only";

import { cookies } from "next/headers";

import type { Session } from "@/types/auth";
import { SESSION_COOKIE, decodeSession } from "./session-cookie";

/** Reads the current session in a Server Component, layout, or route handler. */
export async function getSession(): Promise<Session | null> {
    const store = await cookies();
    return decodeSession(store.get(SESSION_COOKIE)?.value);
}
