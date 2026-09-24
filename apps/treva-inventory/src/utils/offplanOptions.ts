export type DropdownOption = { id: string; label: string };

// The Profitbase sync writes these same values (see treva-api
// src/profitbase/profitbase-mappers.ts), so synced records match an option.
export const TYPE_OF_BUILDING_OPTIONS: DropdownOption[] = [
    { id: "Residential building", label: "Residential building" },
    { id: "Apartment block", label: "Apartment block" },
    { id: "Villa complex", label: "Villa complex" },
    { id: "Townhouse", label: "Townhouse" },
    { id: "Business center", label: "Business center" },
    { id: "Mixed-use building", label: "Mixed-use building" },
    { id: "Parking", label: "Parking" },
];

export const CONSTRUCTION_STAGE_OPTIONS: DropdownOption[] = [
    { id: "Planning", label: "Planning" },
    { id: "Foundation", label: "Foundation" },
    { id: "Under construction", label: "Under construction" },
    { id: "Finishing", label: "Finishing" },
    { id: "Ready", label: "Ready" },
];

export const REAL_ESTATE_TYPE_OPTIONS: DropdownOption[] = [
    { id: "Apartment", label: "Apartment" },
    { id: "Townhouse", label: "Townhouse" },
    { id: "Villa", label: "Villa" },
    { id: "Commercial", label: "Commercial" },
    { id: "Parking", label: "Parking" },
];

export type UnitRenovation = "renovated" | "non-renovated";
export type UnitFurnishing = "furnished" | "partially-furnished" | "unfurnished";

export const RENOVATION_OPTIONS: DropdownOption[] = [
    { id: "renovated", label: "Renovated" },
    { id: "non-renovated", label: "Not renovated" },
];

export const FURNISHING_OPTIONS: DropdownOption[] = [
    { id: "furnished", label: "Furnished" },
    { id: "partially-furnished", label: "Partially furnished" },
    { id: "unfurnished", label: "Unfurnished" },
];

/**
 * Options plus the stored value when it is not one of them, so a dropdown
 * shows what is saved instead of falling back to its placeholder.
 */
export function withCurrentOption(options: DropdownOption[], value: string | null | undefined): DropdownOption[] {
    if (!value || options.some((option) => option.id === value)) return options;
    return [{ id: value, label: value }, ...options];
}
