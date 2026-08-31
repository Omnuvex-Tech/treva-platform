import { delay, paginate, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { MOCK_BROKERS, MOCK_CLIENTS } from "@/mocks/clients";
import type { Client, ClientInput, ClientListQuery } from "../types";

let clients: Client[] = [...MOCK_CLIENTS];

function brokerName(brokerId: string): string {
    return MOCK_BROKERS.find((broker) => broker.id === brokerId)?.name ?? "Unassigned";
}

export async function list(query: ClientListQuery = {}): Promise<Paginated<Client>> {
    await delay();

    let filtered = searchBy(clients, query.search, [
        "firstName",
        "lastName",
        "email",
        "phone",
        "interest",
        "brokerName",
    ]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((client) => client.status === query.status);
    }

    // The server, not the UI, is what scopes a broker to their own book — the
    // real API will do this from the token rather than a query param.
    if (query.brokerId) {
        filtered = filtered.filter((client) => client.brokerId === query.brokerId);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 8 });
}

export async function detail(id: string): Promise<Client> {
    await delay();

    const client = clients.find((entry) => entry.id === id);
    if (!client) throw new ApiError("Client not found", 404, "not_found");

    return client;
}

export async function create(input: ClientInput): Promise<Client> {
    await delay();

    const client: Client = {
        id: `cl_${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email.trim().toLowerCase(),
        brokerId: input.brokerId,
        brokerName: brokerName(input.brokerId),
        budget: input.budget,
        interest: input.interest,
        status: input.status ?? "lead",
        notes: input.notes,
        marketingConsent: input.marketingConsent,
        createdAt: new Date().toISOString(),
    };

    clients = [client, ...clients];
    return client;
}

export async function update(id: string, input: Partial<ClientInput>): Promise<Client> {
    await delay();

    const index = clients.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("Client not found", 404, "not_found");

    const current = clients[index]!;
    const updated: Client = {
        ...current,
        ...input,
        // Reassigning brokers has to keep the denormalised name in step.
        brokerName: input.brokerId ? brokerName(input.brokerId) : current.brokerName,
    };

    clients = clients.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!clients.some((entry) => entry.id === id)) {
        throw new ApiError("Client not found", 404, "not_found");
    }

    clients = clients.filter((entry) => entry.id !== id);
}

export async function removeMany(ids: readonly string[]): Promise<void> {
    await delay();
    const targets = new Set(ids);
    clients = clients.filter((entry) => !targets.has(entry.id));
}
