/**
 * Approval, not pipeline stage.
 *
 * The list draws a green "Approved until <date>" pill (873:49815) and the
 * client's own screen draws an amber "Pending" one (873:49434), so the status a
 * client carries is the outcome of the review the pinned note on the detail
 * screen talks about. `rejected` is the third outcome that review can have; the
 * file only draws the two above.
 */
export type ClientStatus = "pending" | "approved" | "rejected";

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
    /** ISO date the approval lapses. Null unless `status` is "approved". */
    approvedUntil: string | null;
    /** The privacy-policy confirmation the broker ticks before submitting. */
    consent: boolean;
    createdAt: string;
}

export interface ClientListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    /** Backs the "Status" dropdown in the list headline (873:49762). */
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
    additionalPhones: string[];
    email: string;
    /** Not a form field — see the note on `Client.brokerId`. */
    brokerId: string;
    objectOfInterest: string;
    developerBrand: string;
    website: string;
    comments: string;
    consent: boolean;
    status?: ClientStatus;
}
