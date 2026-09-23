import { delay } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { SESSION_MAX_AGE } from "@/lib/auth/session-cookie";
import type { Role } from "@/lib/auth/roles";
import type { LoginPayload, RegisterPayload, Session, SessionUser } from "@/types/auth";

/**
 * Three fixed accounts, one per Figma section — this stands in for the API's
 * user table when NEXT_PUBLIC_USE_MOCK_AUTH is "1" (apps/treva-broker-api is the real one).
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
        email: "info@treva.realestate",
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
    "info@treva.realestate": "admin",
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

/**
 * Creates an account and signs it in.
 *
 * Mirrors treva-broker-api: an individual is a plain broker; creating a company
 * makes the user its owner and a top broker with the company as their team.
 * Sign-up never grants admin. The display name is derived from the address
 * until a profile step exists to ask for one.
 */
export async function register(payload: RegisterPayload): Promise<Session> {
    await delay(600);

    const email = payload.email.trim().toLowerCase();

    if (!email) {
        throw new ApiError("Email is required", 400, "invalid_credentials");
    }
    if (payload.type === "company" && !payload.companyName?.trim()) {
        throw new ApiError("Company name is required", 400, "validation_error");
    }
    if (ACCOUNTS[email]) {
        throw new ApiError("That address is already registered", 409, "email_taken");
    }

    const local = email.split("@")[0] ?? email;
    const id = Date.now().toString(36);
    const companyName = payload.type === "company" ? payload.companyName?.trim() : undefined;
    const company = companyName
        ? { id: `cmp_${id}`, name: companyName, role: "owner" as const }
        : null;
    const user: SessionUser = {
        ...(company ? MOCK_USERS.top_broker : MOCK_USERS.broker),
        id: `usr_${id}`,
        email,
        teamId: company?.id ?? null,
        jobTitle: company ? "Company Owner" : "Broker",
        company,
        // "leyla.hasanova" -> "Leyla Hasanova", so the header chip has
        // something to show until a profile step asks for a real name.
        fullName: local
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
    };

    return {
        user,
        accessToken: "",
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
    };
}

export async function logout(): Promise<void> {
    await delay(120);
}
