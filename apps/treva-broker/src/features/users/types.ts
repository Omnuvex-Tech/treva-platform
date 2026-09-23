import type { Role } from "@/lib/auth/roles";

/** The two entities the Users screen switches between (873:48476 / 873:48597). */
export type UsersTab = "user" | "agency";

export interface Agency {
    id: string;
    name: string;
    /** The account that owns the agency — the Manager field picks it. */
    managerId: string;
    managerName: string;
    /** Every number on the manager's account, primary first. */
    phones: string[];
    /**
     * The tab's Organization column (873:48597), which the artboard draws
     * blank in all five rows. Free text with no meaning the design ever gave
     * it — kept because admins asked for the box, not because it is defined.
     */
    organization: string;
    email: string;
}

export interface AgencyInput {
    name: string;
    /**
     * The new manager's sign-in password. Read only while an account is being
     * created; blank generates a one-time one.
     */
    password?: string;
    /**
     * An existing account to put in charge. Empty means the form is creating
     * one instead, from `managerName` and `email`.
     */
    managerId: string;
    /** Only sent while creating a manager; omitted when one is chosen. */
    managerName?: string;
    phones: string[];
    organization: string;
    email?: string;
}

/** An account the Manager field can offer: one that belongs to no agency. */
export interface ManagerOption {
    id: string;
    fullName: string;
    email: string;
    phones: string[];
}

export type UserStatus = "active" | "blocked" | "invited";

export interface PlatformUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    /** Every number on the account, primary first (873:48716). */
    phones: string[];
    /**
     * The User tab prints this in a column of its own (873:48530), so the shape
     * carries it rather than the table inventing a placeholder.
     *
     * A real backend cannot serve this: passwords are stored hashed and are not
     * recoverable, so the column will show whatever the API returns — a
     * one-time credential at best, blank at worst. Flagged for design; the
     * screen is built as drawn.
     */
    password: string;
    role: Role;
    organization: string;
    jobTitle: string;
    /** Cooperation Type on the agent form (873:48721). */
    cooperationType: string;
    /** Agency (873:48724) — the real-estate agency the agent belongs to. */
    agency: string;
    /** Access Permissions (873:48725) — a single choice, not a set. */
    accessPermission: string;
    status: UserStatus;
    /** Last Login column (873:48560); `null` until the account first signs in. */
    lastLoginAt: string | null;
    createdAt: string;
}

export interface UserListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: UserStatus | "all";
    /** The toolbar's Cooperation Type filter (873:48499). */
    cooperationType?: string;
}

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    /**
     * Optional because the agent form does not collect one (873:48686 draws no
     * password field) — the account gets a first-login credential it then
     * changes on its own Profile screen (873:48781), which is the only place in
     * the file that asks for one.
     */
    password?: string;
    phones: string[];
    jobTitle: string;
    organization: string;
    cooperationType: string;
    agency: string;
    accessPermission: string;
    role: Role;
    /** The "block agent" toggle in the form — maps onto `status`. */
    blocked: boolean;
}

/**
 * The row under the agent editor (873:48887) — the agency record the account is
 * attached to. Read-only: the artboard draws no actions on it.
 */
export interface UserAgencyLink {
    status: "new" | "active" | "pending";
    marketingName: string;
    city: string;
    registrationDate: string;
    crmConnection: string;
}
