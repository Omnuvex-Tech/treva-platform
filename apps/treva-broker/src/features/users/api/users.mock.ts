import { delay, paginate, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { MOCK_AGENCIES } from "@/mocks/agencies";
import { MOCK_USERS } from "@/mocks/users";
import type {
    PlatformUser,
    UserAgencyLink,
    UserInput,
    UserListQuery,
} from "../types";

let users: PlatformUser[] = [...MOCK_USERS];

export async function list(query: UserListQuery = {}): Promise<Paginated<PlatformUser>> {
    await delay();

    // The artboard's search box reads "by name, surname, or phone number"
    // (873:48498), so email and organization are not matched here.
    let filtered = searchBy(users, query.search, ["firstName", "lastName", "phone"]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((user) => user.status === query.status);
    }

    if (query.cooperationType) {
        filtered = filtered.filter((user) => user.cooperationType === query.cooperationType);
    }

    // Fixture order IS the artboard's row order, so the list is left alone
    // rather than re-sorted by creation date.
    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 8 });
}

export async function detail(id: string): Promise<PlatformUser> {
    await delay();

    const user = users.find((entry) => entry.id === id);
    if (!user) throw new ApiError("User not found", 404, "not_found");

    return user;
}

/**
 * The single row under the agent editor (873:48887).
 *
 * Derived from the agency the account names rather than stored: the artboard
 * shows one agency per agent, and the Agencies tab already owns those records.
 */
export async function agencyLink(id: string): Promise<UserAgencyLink | null> {
    await delay();

    const user = users.find((entry) => entry.id === id);
    if (!user) throw new ApiError("User not found", 404, "not_found");

    const agency = MOCK_AGENCIES.find((entry) => entry.name === user.agency);
    if (!agency) return null;

    return {
        status: "new",
        marketingName: agency.name,
        city: "Baku, Azerbaijan",
        registrationDate: "2026-07-07T10:00:00.000Z",
        crmConnection: "299",
    };
}

/**
 * A first-login credential for an account created without one.
 *
 * The agent form has no password field, yet the User tab prints a password for
 * every row — so something has to mint it. A real API would do this server-side
 * and mail it out; here it only has to be unique and readable.
 */
function firstLoginPassword(firstName: string): string {
    const stem = firstName.trim().toLowerCase().slice(0, 8) || "agent";
    return `${stem}${Math.floor(100 + Math.random() * 900)}`;
}

export async function create(input: UserInput): Promise<PlatformUser> {
    await delay();

    const email = input.email.trim().toLowerCase();

    if (email && users.some((entry) => entry.email.toLowerCase() === email)) {
        throw new ApiError("A user with this email already exists", 409, "email_taken");
    }

    const user: PlatformUser = {
        id: `usr_${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        password: input.password || firstLoginPassword(input.firstName),
        phone: input.phone,
        role: input.role,
        organization: input.organization,
        jobTitle: input.jobTitle,
        cooperationType: input.cooperationType,
        agentlik: input.agentlik,
        agency: input.agency,
        accessPermission: input.accessPermission,
        // A new account has not signed in yet, so it starts as invited unless it
        // was created blocked outright.
        status: input.blocked ? "blocked" : "invited",
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
    };

    users = [user, ...users];
    return user;
}

export async function update(id: string, input: Partial<UserInput>): Promise<PlatformUser> {
    await delay();

    const index = users.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("User not found", 404, "not_found");

    const current = users[index]!;
    const { blocked, password, ...rest } = input;

    // An absent or empty password means "leave the stored one alone" — the
    // agent form never sends one, and Profile sends one only when it is typed.
    if (password) (rest as { password?: string }).password = password;

    const updated: PlatformUser = {
        ...current,
        ...rest,
        status:
            blocked === undefined
                ? current.status
                : blocked
                  ? "blocked"
                  : current.status === "blocked"
                    ? "active"
                    : current.status,
    };

    users = users.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!users.some((entry) => entry.id === id)) {
        throw new ApiError("User not found", 404, "not_found");
    }

    users = users.filter((entry) => entry.id !== id);
}
