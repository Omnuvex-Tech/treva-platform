"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { SessionUser } from "@/types/auth";
import { roleCan, roleCanAny, type Permission } from "@/lib/auth/permissions";

interface SessionContextValue {
    user: SessionUser;
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Makes the signed-in user available to Client Components.
 *
 * The session itself is read on the server (cookie) and handed down as a prop —
 * there is no client-side fetch of `/auth/me` on boot, so the sidebar renders
 * with the right items on the very first paint instead of flashing a
 * broker-shaped nav before an admin one.
 *
 * This is a convenience layer, never a security boundary: `can()` decides what
 * to *render*. Access is enforced server-side in lib/auth/guard.ts and,
 * ultimately, by the API.
 */
export function SessionProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
    const value = useMemo<SessionContextValue>(
        () => ({
            user,
            can: (permission) => roleCan(user.role, permission),
            canAny: (permissions) => roleCanAny(user.role, permissions),
        }),
        [user],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession must be used inside a SessionProvider (dashboard layout).");
    }

    return context;
}

/** Shorthand for the common `const { can } = useSession()` case. */
export function useCan(permission: Permission): boolean {
    return useSession().can(permission);
}
