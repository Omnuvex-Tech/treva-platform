export const ROLE_SUPERADMIN = 'superadmin';
export const ROLE_USER = 'user';

export const ROLES = [ROLE_SUPERADMIN, ROLE_USER] as const;
export type Role = (typeof ROLES)[number];

/**
 * Menu keys the inventory sidebar can grant per section. Keys mirror the
 * `MenuKey` union rendered in the frontend accordion, so a section/menuKey pair
 * maps one-to-one onto a sidebar entry. The same menuKey may appear under both
 * sections (for example `attributes`), which is why permissions are stored as a
 * section + menuKey pair rather than a bare key.
 */
export const PERMISSION_CATALOG = {
  offplan: [
    'offplan',
    'objects',
    'magazine',
    'unitLayouts',
    'unitTypes',
    'locationOptions',
    'attributes',
  ],
  resale: [
    'resale',
    'apartments',
    'apartmentTypes',
    'attributes',
    'owners',
    'locationOptions',
    'requests',
  ],
} as const;

export type PermissionSection = keyof typeof PERMISSION_CATALOG;

export const PERMISSION_SECTIONS = Object.keys(
  PERMISSION_CATALOG,
) as PermissionSection[];

export function isPermissionSection(value: string): value is PermissionSection {
  return (PERMISSION_SECTIONS as string[]).includes(value);
}

export function isMenuKeyInSection(
  section: PermissionSection,
  menuKey: string,
) {
  return (PERMISSION_CATALOG[section] as readonly string[]).includes(menuKey);
}
