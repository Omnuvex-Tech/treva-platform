import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type Admin } from "../api/auth";
import { hasMenuAccess } from "../lib/permissions";

const AUTH_CHANGED_EVENT = "treva-inventory:auth-changed";
const UNAUTHORIZED_EVENT = "treva-inventory:unauthorized";

/** Lets the login and logout flows tell the provider to re-read the token. */
export function notifyAuthChanged() {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

interface AuthContextValue {
    profile: Admin | null;
    isLoading: boolean;
    isSuperAdmin: boolean;
    canAccess: (section: string, menuKey: string) => boolean;
    canAccessSection: (section: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("token"),
    );

    useEffect(() => {
        const syncToken = () => setToken(localStorage.getItem("token"));

        window.addEventListener(AUTH_CHANGED_EVENT, syncToken);
        window.addEventListener(UNAUTHORIZED_EVENT, syncToken);
        window.addEventListener("storage", syncToken);

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, syncToken);
            window.removeEventListener(UNAUTHORIZED_EVENT, syncToken);
            window.removeEventListener("storage", syncToken);
        };
    }, []);

    const { data: profile, isLoading } = useQuery({
        queryKey: ["auth", "profile", token],
        queryFn: () => authApi.getProfile().then((res) => res.data),
        enabled: Boolean(token),
        retry: false,
        staleTime: 60_000,
    });

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        queryClient.removeQueries({ queryKey: ["auth", "profile"] });
        notifyAuthChanged();
    }, [queryClient]);

    const value = useMemo<AuthContextValue>(() => {
        const current = profile ?? null;
        const isSuperAdmin = current?.role === "superadmin";

        return {
            profile: current,
            isLoading: Boolean(token) && isLoading,
            isSuperAdmin,
            canAccess: (section, menuKey) =>
                isSuperAdmin ||
                hasMenuAccess(current?.permissions ?? [], section, menuKey),
            canAccessSection: (section) =>
                isSuperAdmin ||
                (current?.permissions ?? []).some(
                    (entry) => entry.section === section && entry.menuKeys.length > 0,
                ),
            logout,
        };
    }, [profile, isLoading, token, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
