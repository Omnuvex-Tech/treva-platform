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

/**
 * What sign-up sends.
 *
 * Only the individual branch is wired: the artboards draw the type step and
 * nothing after it, so a personal account is created from an address and a
 * password the way signing in reads them. `type` rides along so the company
 * branch has somewhere to land once its screens exist.
 */
export interface RegisterPayload {
    email: string;
    password: string;
    type: "individual" | "company";
}
