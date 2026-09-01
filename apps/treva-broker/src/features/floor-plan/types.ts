export type UnitStatus = "available" | "reserved" | "sold" | "blocked";

export const UNIT_STATUSES: readonly UnitStatus[] = [
    "available",
    "reserved",
    "sold",
    "blocked",
];

export interface Unit {
    id: string;
    /** e.g. "1204" — floor 12, position 04. */
    code: string;
    position: number;
    floor: number;
    status: UnitStatus;
    bedrooms: number;
    areaSqm: number;
    price: number;
}

export interface Floor {
    level: number;
    /** "F18" — the label drawn down the left edge of the grid. */
    label: string;
    units: Unit[];
}

export interface Building {
    id: string;
    name: string;
    projectName: string;
    floors: Floor[];
    counts: Record<UnitStatus, number>;
}

export interface BuildingSummary {
    id: string;
    name: string;
}
