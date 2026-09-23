import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { Client, ClientInput, ClientListQuery } from "../types";

/**
 * Real adapter against apps/treva-broker-api, used while
 * NEXT_PUBLIC_USE_MOCK_CLIENTS is "0". The API answers in these exact shapes
 * (see ClientsService there) and scopes every call to the signed-in user, so
 * `brokerId` here only narrows what that user may already see.
 */
export async function list(query: ClientListQuery = {}): Promise<Paginated<Client>> {
    return http.get<Paginated<Client>>(endpoints.clients.list, {
        params: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
            brokerId: query.brokerId,
        },
    });
}

export async function detail(id: string): Promise<Client> {
    return http.get<Client>(endpoints.clients.detail(id));
}

export async function create(input: ClientInput): Promise<Client> {
    return http.post<Client>(endpoints.clients.list, input);
}

export async function update(id: string, input: Partial<ClientInput>): Promise<Client> {
    return http.patch<Client>(endpoints.clients.detail(id), input);
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.clients.detail(id));
}

export async function removeMany(ids: readonly string[]): Promise<void> {
    // One round trip rather than N — the table lets the user tick several rows.
    await http.post<void>(`${endpoints.clients.list}/bulk-delete`, { ids });
}
