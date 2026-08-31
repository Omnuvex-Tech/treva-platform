"use client";

import type { ReactNode } from "react";

import type { Permission } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";

export interface PermissionGateProps {
    /** Rendered only if the role holds every listed permission. */
    permission: Permission | Permission[];
    /** Pass `any` to require just one of them instead. */
    mode?: "all" | "any";
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Declarative wrapper for the `can(...) ? <X /> : null` pattern.
 *
 * Worth reaching for when a whole block (a toolbar, a table column group, a
 * side panel) is permission-scoped. For a single button, an inline `can()` call
 * reads better than wrapping it.
 *
 * This hides UI; it does not protect data. The server guard in
 * `lib/auth/guard.ts` and the API are what enforce access.
 */
export function PermissionGate({
    permission,
    mode = "all",
    children,
    fallback = null,
}: PermissionGateProps) {
    const { can, canAny } = useSession();

    const permissions = Array.isArray(permission) ? permission : [permission];
    const allowed = mode === "any" ? canAny(permissions) : permissions.every(can);

    return <>{allowed ? children : fallback}</>;
}
