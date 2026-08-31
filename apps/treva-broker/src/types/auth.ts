import type { Role } from "@/lib/auth/roles";

export interface SessionUser {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    avatarUrl: string | null;
    /** Set for brokers that belong to a top broker's team. */
    teamId: string | null;
    jobTitle: string;
}

export interface Session {
    user: SessionUser;
    /** Bearer token for the NestJS API. Empty string while the mock adapter is on. */
    accessToken: string;
    expiresAt: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    rememberMe: boolean;
}
