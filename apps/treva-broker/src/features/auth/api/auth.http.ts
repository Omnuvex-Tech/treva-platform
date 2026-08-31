import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { LoginPayload, Session } from "@/types/auth";

/**
 * Real adapter against the NestJS broker API.
 *
 * Written now, deliberately unused until NEXT_PUBLIC_USE_MOCK flips to "0" —
 * having it in place is what keeps the mock honest about the shape the backend
 * has to return. Adjust the response mapping here (and only here) once the API
 * contract is final.
 */
export async function login(payload: LoginPayload): Promise<Session> {
    // The response carries the account's role; the client never asserts one.
    return http.post<Session>(endpoints.auth.login, payload);
}

export async function logout(): Promise<void> {
    await http.post<void>(endpoints.auth.logout);
}
