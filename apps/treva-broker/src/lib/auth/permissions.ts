import type { Role } from "./roles";

/**
 * Permissions, not roles, are what components check.
 *
 * The three roles share every screen — the design differs only in which
 * affordances are present (Broker has no "Add news" / "Edit" / delete, Admin
 * additionally gets the Admin Panel group). Encoding that as
 * `can(user, "news:create")` rather than `role === "admin"` is what keeps a new
 * role (say "manager") from turning into a repo-wide find-and-replace.
 */
export const PERMISSIONS = [
    "news:read",
    "news:create",
    "news:update",
    "news:delete",
    "news:pin",

    "clients:read",
    "clients:read_all",
    "clients:create",
    "clients:update",
    "clients:delete",
    "clients:assign",

    "brokers:read",
    "brokers:create",
    "brokers:update",
    "brokers:delete",

    "finance:read",
    "finance:read_all",
    "finance:export",

    "projects:read",
    "projects:create",
    "projects:update",
    "projects:delete",

    "floorplan:read",
    "floorplan:manage",

    "admin:access",
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "listings:read",
    "listings:manage",
    "language:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * VERIFIED vs ASSUMED — read before editing.
 *
 * Verified against the artboards: on **News Feed**, the Top Broker screen is
 * pixel-identical to the Broker one — neither has "Add news", "Edit" or the
 * delete icon. Only the Admin section has them. So news writes are admin-only
 * below, even though a Top Broker outranks a Broker elsewhere.
 *
 * ASSUMED, pending review against the remaining artboards: everything else in
 * TOP_BROKER_PERMISSIONS (team-wide client/finance visibility, broker and
 * project management). Those rows were inferred from the role name, not read
 * off a screen. Confirm each against the Top Broker section before treating
 * this matrix as final.
 */

/** Everything a plain broker can do — the baseline the other roles extend. */
const BROKER_PERMISSIONS: readonly Permission[] = [
    "news:read",
    "clients:read",
    "clients:create",
    "clients:update",
    "brokers:read",
    "finance:read",
    "projects:read",
    "floorplan:read",
];

/**
 * A top broker owns a team: team-wide visibility plus team management.
 *
 * Note what is NOT here: news writes. The News Feed artboard for this role has
 * no management affordances — publishing is an admin activity.
 */
const TOP_BROKER_PERMISSIONS: readonly Permission[] = [
    ...BROKER_PERMISSIONS,
    "clients:read_all",
    "clients:delete",
    "clients:assign",
    "brokers:create",
    "brokers:update",
    "finance:read_all",
    "finance:export",
    "projects:create",
    "projects:update",
];

/** Admin gets the union of everything, including the Admin Panel group. */
const ADMIN_PERMISSIONS: readonly Permission[] = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
    broker: BROKER_PERMISSIONS,
    top_broker: TOP_BROKER_PERMISSIONS,
    admin: ADMIN_PERMISSIONS,
};

/**
 * Lookup sets, built once at module load. `can()` runs on every nav item and
 * every action button of every render; a linear scan of a 30-entry array would
 * be doing that work over and over for no reason.
 */
const ROLE_PERMISSION_SETS: Record<Role, ReadonlySet<Permission>> = {
    broker: new Set(BROKER_PERMISSIONS),
    top_broker: new Set(TOP_BROKER_PERMISSIONS),
    admin: new Set(ADMIN_PERMISSIONS),
};

export function roleCan(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSION_SETS[role].has(permission);
}

/** True only when the role holds every one of the listed permissions. */
export function roleCanAll(role: Role, permissions: readonly Permission[]): boolean {
    return permissions.every((permission) => roleCan(role, permission));
}

/** True when the role holds at least one of the listed permissions. */
export function roleCanAny(role: Role, permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => roleCan(role, permission));
}
