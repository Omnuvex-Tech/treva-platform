import type { Layout } from "@/features/floor-plan/types";

/**
 * What the card's pill says (I873:49156;13186:133).
 *
 * Every card in the artboard reads "Active" on the positive fill, so the pill
 * is a switch on the project, not a stage in a pipeline — an earlier pass
 * invented planning/construction/ready/soldOut before the file was read.
 * "inactive" is the necessary complement; the file only draws the on state.
 */
export type ProjectStatus = "active" | "inactive";

/**
 * One row of Key Highlights (873:51133).
 *
 * A label over a value with an icon and a switch — "Handover / Q4 2026",
 * "Payment Plan / 50/50". The artboard renders every one as "Lorem Ipsum", but
 * its layer names carry the intended examples, which is where `kind` comes
 * from: the six drawn are handover, payment plan, sea view, amenities, transit
 * and mortgage, each with its own glyph.
 */
export const HIGHLIGHT_KINDS = [
    "handover",
    "payment",
    "view",
    "amenities",
    "transit",
    "mortgage",
] as const;

export type HighlightKind = (typeof HIGHLIGHT_KINDS)[number];

export interface ProjectHighlight {
    id: string;
    kind: HighlightKind;
    label: string;
    value: string;
    /** The switch on the row; off greys the whole card out. */
    enabled: boolean;
}

/** The badge a Special Offer carries (873:51244). */
export type OfferTag = "new" | "limited" | "exclusive";

export interface ProjectOffer {
    id: string;
    tag: OfferTag;
    title: string;
    description: string;
    /** ISO date, or empty while the picker has not been filled in. */
    expiresAt: string;
    enabled: boolean;
}

/** A row of the Marketing Materials table (873:51319). */
export interface ProjectMaterial {
    id: string;
    name: string;
    category: string;
    language: string;
    sizeBytes: number;
    /**
     * How many times agents have pulled the file down. The editor's table does
     * not show it; the detail screen's list does (1173:16305).
     */
    downloads: number;
}

/**
 * One row of the Finance table on a project's own screen (1173:16374).
 *
 * The artboard fills every cell with the same placeholder, so the field names
 * come from its column headers: No, Project Name, the unit code (its header
 * reads "A 23 - 02", which is a value that leaked into the header), Listing
 * Price, Sales Price, then Received / Paid / Remaining under one heading, and
 * Sales Date.
 */
export interface ProjectFinanceRow {
    id: string;
    projectName: string;
    unitCode: string;
    listingPrice: number;
    salesPrice: number;
    received: number;
    paid: number;
    remaining: number;
    /** ISO date, or empty while the sale has not closed. */
    salesDate: string;
}

/**
 * The three counts under Live Availability (873:51375).
 *
 * Kept as a triple rather than derived from `unitsTotal` because the section
 * has an "Auto Calculate" switch: with it off the numbers are typed in, and
 * with it on they are the ones the unit inventory reports.
 */
export interface ProjectAvailability {
    available: number;
    reserved: number;
    sold: number;
    /** The switch beside the section heading (873:51373). */
    autoCalculate: boolean;
    /**
     * ISO stamp behind "Last synced: 14 min ago" (1173:16467). Only the detail
     * screen prints it — the editor draws the switch there instead.
     */
    lastSyncedAt: string;
}

export interface Project {
    id: string;
    name: string;
    developer: string;
    location: string;
    status: ProjectStatus;
    /** Lowest available unit price, in AZN. */
    priceFrom: number;
    unitsTotal: number;
    unitsAvailable: number;
    bedroomsFrom: number;
    bedroomsTo: number;
    /** ISO date the developer expects to hand over. */
    deliveryDate: string;
    /** Backs the card's relative stamp ("2h ago"). */
    updatedAt: string;
    coverImageUrl: string | null;
    /** The public page the editor's URL field points at (914:15512). */
    publicUrl: string;
    /** The 1104x368 hero at the top of the editor (873:51116). */
    heroImageUrl: string | null;
    /** The three 355x200 tiles under it (873:51119…). */
    galleryImageUrls: string[];
    highlights: ProjectHighlight[];
    offers: ProjectOffer[];
    materials: ProjectMaterial[];
    availability: ProjectAvailability;
    /**
     * The Finance and Floor Plan blocks on the detail screen (1173:16358 /
     * 1173:16458). Both carry a "Page Link" action to the section that owns
     * them, so what a project holds is an extract, not the whole ledger — the
     * artboard shows eight rows and four layouts with no pager.
     *
     * `layouts` reuses the floor-plan feature's own type: the cards here are
     * that feature's Layouts tiles, down to the block chip and the property
     * pill, so duplicating the shape would guarantee the two drift.
     */
    financeRows: ProjectFinanceRow[];
    layouts: Layout[];
}

export interface ProjectListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: ProjectStatus | "all";
}

/** Everything the editor (873:51091) owns. */
export interface ProjectInput {
    name: string;
    publicUrl: string;
    heroImageUrl: string | null;
    galleryImageUrls: string[];
    highlights: ProjectHighlight[];
    offers: ProjectOffer[];
    availability: ProjectAvailability;
}
