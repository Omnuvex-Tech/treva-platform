export type ClientStatus = "lead" | "active" | "negotiating" | "closed" | "lost";

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    /** Id of the broker who owns the relationship. */
    brokerId: string;
    brokerName: string;
    budget: number;
    interest: string;
    status: ClientStatus;
    notes: string;
    marketingConsent: boolean;
    createdAt: string;
}

export interface ClientListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: ClientStatus | "all";
    /**
     * Scopes the list to one broker. A plain broker only ever sees their own
     * clients — the caller passes their own id; roles with `clients:read_all`
     * leave it undefined.
     */
    brokerId?: string;
}

export interface ClientInput {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    brokerId: string;
    budget: number;
    interest: string;
    notes: string;
    marketingConsent: boolean;
    status?: ClientStatus;
}
