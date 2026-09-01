import type { Role } from "@/lib/auth/roles";

/** The two entities the Users screen switches between (873:48476 / 873:48597). */
export type UsersTab = "user" | "agency";

export interface Agency {
    id: string;
    name: string;
    managerName: string;
    phone: string;
    organization: string;
    email: string;
}

export interface AgencyInput {
    name: string;
    managerName: string;
    phone: string;
    organization: string;
    email: string;
}

export type UserStatus = "active" | "blocked" | "invited";

export interface PlatformUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
    organization: string;
    jobTitle: string;
    status: UserStatus;
    createdAt: string;
}

export interface UserListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: UserStatus | "all";
}

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    jobTitle: string;
    organization: string;
    role: Role;
    /** The "block agent" toggle in the form — maps onto `status`. */
    blocked: boolean;
}
