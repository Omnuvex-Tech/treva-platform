/**
 * What the card's pill says (I873:49156;13186:133).
 *
 * Every card in the artboard reads "Active" on the positive fill, so the pill
 * is a switch on the project, not a stage in a pipeline — an earlier pass
 * invented planning/construction/ready/soldOut before the file was read.
 * "inactive" is the necessary complement; the file only draws the on state.
 */
export type ProjectStatus = "active" | "inactive";

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
}

export interface ProjectListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: ProjectStatus | "all";
}
