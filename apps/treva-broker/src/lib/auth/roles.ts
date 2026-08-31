/**
 * The three sections of the Figma file map 1:1 onto these roles. The string
 * values are what the NestJS API is expected to return, so keep them in sync
 * with the Prisma enum when the backend lands.
 */
export const ROLES = ["broker", "top_broker", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
    broker: "Broker",
    top_broker: "Top Broker",
    admin: "Admin",
};

export function isRole(value: string | undefined | null): value is Role {
    return !!value && (ROLES as readonly string[]).includes(value);
}
