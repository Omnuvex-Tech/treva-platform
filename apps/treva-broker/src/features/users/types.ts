import type { Role } from "@/lib/auth/roles";

export type UserStatus = "active" | "blocked" | "invited";

export interface PlatformUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: Role;
    team: string;
    jobTitle: string;
    status: UserStatus;
    createdAt: string;
}

export interface UserListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    /** The segmented control above the table. */
    status?: UserStatus | "all";
}

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    jobTitle: string;
    team: string;
    role: Role;
    /** The "block agent" toggle in the form — maps onto `status`. */
    blocked: boolean;
}
