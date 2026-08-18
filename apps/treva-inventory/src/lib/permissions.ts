import type { SectionPermission } from "../api/users";

export type PermissionSection = "offplan" | "resale";

export interface PermissionMenu {
    key: string;
    label: string;
}

export interface PermissionSectionConfig {
    key: PermissionSection;
    label: string;
    menus: PermissionMenu[];
}

/**
 * Mirrors the sidebar accordion (and the API's PERMISSION_CATALOG) so the user
 * form offers exactly the menus that can actually be rendered. A menu key can
 * repeat across sections, so access is always keyed by section + menu.
 */
export const PERMISSION_SECTIONS: PermissionSectionConfig[] = [
    {
        key: "resale",
        label: "Resale",
        menus: [
            { key: "resale", label: "Dashboard" },
            { key: "apartments", label: "Listings" },
            { key: "apartmentTypes", label: "Listing Types" },
            { key: "attributes", label: "Attributes" },
            { key: "owners", label: "Owners" },
            { key: "locationOptions", label: "Locations" },
            { key: "requests", label: "Requests" },
        ],
    },
    {
        key: "offplan",
        label: "Off-plan",
        menus: [
            { key: "offplan", label: "Dashboard" },
            { key: "objects", label: "Objects" },
            { key: "magazine", label: "Magazine" },
            { key: "unitLayouts", label: "Unit Layouts" },
            { key: "unitTypes", label: "Unit Types" },
            { key: "locationOptions", label: "Locations" },
            { key: "attributes", label: "Attributes" },
        ],
    },
];

export function getSectionConfig(section: string) {
    return PERMISSION_SECTIONS.find((entry) => entry.key === section) ?? null;
}

export function hasMenuAccess(
    permissions: SectionPermission[],
    section: string,
    menuKey: string,
) {
    return permissions.some(
        (entry) => entry.section === section && entry.menuKeys.includes(menuKey),
    );
}

/** Every menu of a section, used when granting a section for the first time. */
export function allMenuKeys(section: PermissionSection) {
    return getSectionConfig(section)?.menus.map((menu) => menu.key) ?? [];
}
