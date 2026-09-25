/**
 * The outcome of checking the client against Bitrix24, which the API does as
 * soon as the client is registered:
 *
 *  - "pending": not checked yet (Bitrix unreachable — it is retried);
 *  - "deal_created": Bitrix had no contact with this phone or email, so one
 *    was created with a deal in "Сделки от агентов";
 *  - "already_in_bitrix": Bitrix already knows the client — no deal.
 *
 * The pills keep the design's shape (873:49815, 873:49434); only the three
 * outcomes they name have changed from a manual review.
 */
export type ClientStatus = "pending" | "deal_created" | "already_in_bitrix";

/** Whether the client has reached Bitrix24 as a lead. */
export type BitrixSyncState = "pending" | "synced" | "failed";

/** Bitrix's stage semantics: "P" in progress, "S" won, "F" lost. */
export type DealStageSemantics = "P" | "S" | "F";

/** The deal Bitrix24 converted the client's lead into. */
export interface ClientDeal {
    id: number;
    title: string;
    /** The stage's name, as Bitrix spells it. */
    stage: string;
    stageSemantics: DealStageSemantics;
    amount: number | null;
    currency: string | null;
}

export interface ClientBitrix {
    /**
     * The Bitrix contact — created for a new client, or the existing one that
     * matched. Null until the check has run.
     */
    contactId: number | null;
    syncState: BitrixSyncState;
    /** Why the last push failed. Only ever sent to admins. */
    syncError: string | null;
    syncedAt: string | null;
    /** The deal created for a new client; null otherwise. */
    deal: ClientDeal | null;
}

export interface Client {
    id: string;
    /** "Name" on the lead form (873:49388). */
    firstName: string;
    /** "Surname" (873:49389). */
    lastName: string;
    /** "Primary number" (873:49392). */
    phone: string;
    /** Numbers added with the 36x36 "+" beside the primary one (873:49393). */
    additionalPhones: string[];
    email: string;
    /**
     * The broker who owns the relationship — shown as "Agent" on the client's
     * own screen. The lead form has no field for it: whoever registers the lead
     * gets it, so it comes from the session rather than from user input.
     */
    brokerId: string;
    brokerName: string;
    /** "Object of interest" — a project name, and a list column (873:49804). */
    objectOfInterest: string;
    developerBrand: string;
    website: string;
    /** "Comments" (873:49399). */
    comments: string;
    status: ClientStatus;
    /** No longer set — kept for records made before the Bitrix integration. */
    approvedUntil: string | null;
    /** The privacy-policy confirmation the broker ticks before submitting. */
    consent: boolean;
    createdAt: string;
    bitrix: ClientBitrix;
}

export interface ClientListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    /** Backs the "Status" dropdown in the list headline (873:49762). */
    status?: ClientStatus | "all";
    /**
     * Scopes the list to one broker. Brokers and top brokers only ever see
     * their own clients — the caller passes their own id; an admin
     * (`clients:read_all`) leaves it undefined.
     */
    brokerId?: string;
}

export interface ClientInput {
    firstName: string;
    lastName: string;
    phone: string;
    additionalPhones: string[];
    email: string;
    /** Not a form field — see the note on `Client.brokerId`. */
    brokerId: string;
    objectOfInterest: string;
    developerBrand: string;
    website: string;
    comments: string;
    consent: boolean;
    // No `status`: it is the outcome of the Bitrix24 check, set by the API.
}
