import "server-only";

import { forbidden, redirect } from "next/navigation";

import type { Session } from "@/types/auth";
import type { Locale } from "@/lib/i18n/config";
import { getSession } from "./session";
import { roleCanAll, type Permission } from "./permissions";

/**
 * Server-side gate for a protected page or layout.
 *
 * The middleware already bounces signed-out visitors, so the redirect here is a
 * backstop for the case the middleware matcher does not cover (route handlers,
 * and any path added to the matcher's exclusion list later). Permission checks,
 * on the other hand, only exist here — the middleware runs on the Edge runtime
 * and deliberately stays out of the permission matrix.
 */
export async function requireSession(locale: Locale): Promise<Session> {
    const session = await getSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    return session;
}

export async function requirePermission(
    locale: Locale,
    ...permissions: Permission[]
): Promise<Session> {
    const session = await requireSession(locale);

    if (!roleCanAll(session.user.role, permissions)) {
        // Renders the nearest forbidden.tsx with a 403 rather than pretending
        // the page does not exist — the user is signed in, just not entitled.
        forbidden();
    }

    return session;
}
