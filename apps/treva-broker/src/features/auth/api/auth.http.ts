import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { LoginPayload, RegisterPayload, Session } from "@/types/auth";

/**
 * Real adapter against apps/treva-broker-api, used while
 * NEXT_PUBLIC_USE_MOCK_AUTH is "0". The API already answers in the `Session`
 * shape (see AuthService in that app), so there is no mapping here.
 */
export async function login(payload: LoginPayload): Promise<Session> {
    // The response carries the account's role; the client never asserts one.
    return http.post<Session>(endpoints.auth.login, payload);
}

export async function register(payload: RegisterPayload): Promise<Session> {
    return http.post<Session>(endpoints.auth.register, payload);
}

export async function logout(accessToken?: string): Promise<void> {
    await http.post<void>(endpoints.auth.logout, undefined, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
}
