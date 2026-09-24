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
    /** The company the user belongs to, if any. Absent on mock fixtures. */
    company?: SessionCompany | null;
}

export interface SessionCompany {
    id: string;
    name: string;
    /** "owner" for whoever created it at sign-up. */
    role: "owner" | "member";
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
 * An account is created from an address and a password the way signing in
 * reads them. Creating a company adds only its name — nothing else about the
 * company is collected at sign-up.
 */
export interface RegisterPayload {
    email: string;
    password: string;
    type: "individual" | "company";
    /** Required when `type` is "company". */
    companyName?: string;
}
