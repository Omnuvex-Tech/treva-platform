export type DealType = "sale" | "rent";

export type ListingStatus = "published" | "draft" | "archived";

export interface Listing {
    id: string;
    unitName: string;
    projectName: string;
    dealType: DealType;
    /** Sale price, or monthly rent when `dealType` is "rent". */
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    views: number;
    status: ListingStatus;
    coverImageUrl: string | null;
}

export interface ListingListQuery {
    search?: string;
    status?: ListingStatus | "all";
}

/** The artboard groups the grid into one section per deal type. */
export interface ListingSections {
    sale: Listing[];
    rent: Listing[];
    total: number;
}
