export type ProjectStatus = "planning" | "construction" | "ready" | "soldOut";

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
    coverImageUrl: string | null;
}

export interface ProjectListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    status?: ProjectStatus | "all";
}
