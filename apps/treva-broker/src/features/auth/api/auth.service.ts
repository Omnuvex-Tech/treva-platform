import { config } from "@/config";
import type { LoginPayload, Session } from "@/types/auth";

import * as httpAdapter from "./auth.http";
import * as mockAdapter from "./auth.mock";

/**
 * The contract every auth adapter satisfies. Screens and server actions import
 * `authService` and never the adapters, so switching NEXT_PUBLIC_USE_MOCK off
 * is the only change needed when the NestJS API goes live.
 */
export interface AuthService {
    login(payload: LoginPayload): Promise<Session>;
    logout(): Promise<void>;
}

export const authService: AuthService = config.api.useMock ? mockAdapter : httpAdapter;
