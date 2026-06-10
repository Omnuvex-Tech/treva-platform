export interface UnitLayoutLocation {
    title: string;
    url?: string;
    type: string;
}

export interface UnitLayoutNumberOfFloors {
    start: number;
    end: number;
}

export interface UnitLayoutImage {
    url: string;
    alt?: string;
}

export interface UnitLayoutDocument {
    type: string;
    url: string;
}

export interface UnitLayoutCategory {
    id: string;
    title: string;
    name: string;
    slug: string;
}

export interface UnitLayout {
    id: string;
    title: string;
    name: string;
    slug: string;
    status: "available" | "sold" | "reserved";
    floor: number;
    number?: number;
    totalArea: number;
    internalArea: number;
    balconyArea?: number;
    priceUsd: number;
    priceAzn: number;
    completionYear: number;
    numberOfFloors: UnitLayoutNumberOfFloors;
    view?: string;
    similarApartmentIds: string[];
    mainImage?: UnitLayoutImage;
    gallery: UnitLayoutImage[];
    documents: UnitLayoutDocument[];
    location?: UnitLayoutLocation;
    categoryId: string;
    category: UnitLayoutCategory;
    createdAt: string;
    updatedAt: string;
}

export interface UnitLayoutListResponse {
    data: UnitLayout[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UnitLayoutFilters {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    view?: string;
}
