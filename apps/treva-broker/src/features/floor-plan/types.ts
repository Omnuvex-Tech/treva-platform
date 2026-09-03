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
    /** "Loggia 7.0 m²" on the Properties card (873:50111). */
    loggiaSqm: number;
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

/**
 * What one Listings card needs (886:16162).
 *
 * The screen groups these by `projectName` and draws, per card, the floor count
 * chip, the building name, a price bar and "Tower 3 • 172 residential units".
 */
export interface BuildingSummary {
    id: string;
    name: string;
    projectName: string;
    floors: number;
    unitsTotal: number;
    priceFrom: number;
    imageUrl: string | null;
}

/**
 * The four views the Floor Plan tab strip switches between (873:48933).
 *
 * All four read the same inventory: `grid` is the stacking plan, `gridPlus`
 * the same plan beside a unit rail, `properties` the unit cards and `layouts`
 * the floor drawings.
 */
export const FLOOR_PLAN_VIEWS = ["grid", "gridPlus", "properties", "layouts"] as const;

export type FloorPlanView = (typeof FLOOR_PLAN_VIEWS)[number];

/** One card of the Layouts tab (873:50474). */
export interface Layout {
    id: string;
    /** "Repertoage Heights, R1" — the chip over the drawing. */
    label: string;
    priceFrom: number;
    areaSqm: number;
    /** "1 property" — how many units share this layout. */
    propertyCount: number;
    planImageUrl: string | null;
}
