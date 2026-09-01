import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { PlatformUser, UserInput, UserListQuery } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function list(query: UserListQuery = {}): Promise<Paginated<PlatformUser>> {
    return http.get<Paginated<PlatformUser>>(endpoints.users.list, {
        params: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
        },
    });
}

export async function detail(id: string): Promise<PlatformUser> {
    return http.get<PlatformUser>(endpoints.users.detail(id));
}

export async function create(input: UserInput): Promise<PlatformUser> {
    return http.post<PlatformUser>(endpoints.users.list, input);
}

export async function update(id: string, input: Partial<UserInput>): Promise<PlatformUser> {
    return http.patch<PlatformUser>(endpoints.users.detail(id), input);
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.users.detail(id));
}
