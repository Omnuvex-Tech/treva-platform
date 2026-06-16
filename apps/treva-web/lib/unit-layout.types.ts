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
    floor: number;
    number?: number;
    totalArea: number;
    internalArea: number;
    balconyArea?: number;
    prices: Record<string, number>;
    completionYear: number;
    numberOfFloors: UnitLayoutNumberOfFloors;
    view?: string;
    statusOptionId?: string;
    statusOption?: { id: string; value: string; order: number };
    similarApartmentIds: string[];
    similarApartments?: UnitLayout[];
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
    categorySlug?: string;
    statusOptionId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    viewOptionId?: string;
    rooms?: string;
    roomOptionId?: string;
}
