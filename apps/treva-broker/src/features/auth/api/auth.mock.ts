import { delay } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { SESSION_MAX_AGE } from "@/lib/auth/session-cookie";
import type { Role } from "@/lib/auth/roles";
import type { LoginPayload, Session, SessionUser } from "@/types/auth";

/**
 * Three fixed accounts, one per Figma section — this stands in for the API's
 * user table until the NestJS service exists.
 *
 * The role belongs to the account, exactly as it will on the backend: the login
 * form never sends one. Signing in with a different address is how a reviewer
 * switches between the Broker, Top Broker and Admin variants of every screen.
 * Any password is accepted; this adapter models data, not authentication.
 */
const MOCK_USERS: Record<Role, SessionUser> = {
    admin: {
        id: "usr_admin_1",
        fullName: "Nigar Aliyeva",
        email: "admin@treva.az",
        role: "admin",
        avatarUrl: null,
        teamId: null,
        jobTitle: "Platform Administrator",
    },
    top_broker: {
        id: "usr_top_broker_1",
        fullName: "Rashad Guliyev",
        email: "top.broker@treva.az",
        role: "top_broker",
        avatarUrl: null,
        teamId: "team_1",
        jobTitle: "Head of Sales",
    },
    broker: {
        id: "usr_broker_1",
        fullName: "Leyla Hasanova",
        email: "broker@treva.az",
        role: "broker",
        avatarUrl: null,
        teamId: "team_1",
        jobTitle: "Sales Broker",
    },
};

/** The mock's account table: address -> the role that account carries. */
const ACCOUNTS: Record<string, Role> = {
    "admin@treva.az": "admin",
    "top.broker@treva.az": "top_broker",
    "broker@treva.az": "broker",
};

export async function login(payload: LoginPayload): Promise<Session> {
    await delay(500);

    const email = payload.email.trim().toLowerCase();

    if (!email) {
        throw new ApiError("Email is required", 400, "invalid_credentials");
    }

    // An unknown address falls back to the least-privileged role rather than
    // failing, so the UI stays reviewable — but it never grants more than a
    // plain broker sees.
    const role = ACCOUNTS[email] ?? "broker";
    const user = MOCK_USERS[role];

    return {
        user: { ...user, email },
        accessToken: "",
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
    };
}

export async function logout(): Promise<void> {
    await delay(120);
}
