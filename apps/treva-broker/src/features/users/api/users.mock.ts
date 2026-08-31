import { delay, paginate, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { MOCK_USERS } from "@/mocks/users";
import type { PlatformUser, UserInput, UserListQuery } from "../types";

let users: PlatformUser[] = [...MOCK_USERS];

export async function list(query: UserListQuery = {}): Promise<Paginated<PlatformUser>> {
    await delay();

    let filtered = searchBy(users, query.search, ["firstName", "lastName", "email", "phone", "team"]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((user) => user.status === query.status);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 8 rows is what the artboard shows in the table body.
    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 8 });
}

export async function detail(id: string): Promise<PlatformUser> {
    await delay();

    const user = users.find((entry) => entry.id === id);
    if (!user) throw new ApiError("User not found", 404, "not_found");

    return user;
}

export async function create(input: UserInput): Promise<PlatformUser> {
    await delay();

    const email = input.email.trim().toLowerCase();

    if (users.some((entry) => entry.email.toLowerCase() === email)) {
        throw new ApiError("A user with this email already exists", 409, "email_taken");
    }

    const user: PlatformUser = {
        id: `usr_${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone,
        role: input.role,
        team: input.team,
        jobTitle: input.jobTitle,
        // A new account has not signed in yet, so it starts as invited unless it
        // was created blocked outright.
        status: input.blocked ? "blocked" : "invited",
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
    const { blocked, ...rest } = input;

    // `password` never lands on the stored record — the real API hashes it and
    // it is not part of PlatformUser, so it is simply dropped here.
    delete (rest as { password?: string }).password;

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
