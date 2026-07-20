export interface ResaleApartmentType {
    id: string;
    title: string;
    slug: string;
    order: number;
}

export interface ResaleOwner {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
    phoneNumber: string;
}

export interface ResaleAttribute {
    id: string;
    name: string;
    title: string;
    value: string;
    icon?: string;
}

export interface ResaleLocationOption {
    id: string;
    type: "region" | "city";
    name: string;
    title: string;
    cityId?: string | null;
    city?: {
        id: string;
        name: string;
        title: string;
    } | null;
}

export interface ResaleCurrency {
    id: string;
    name: string;
    value: string;
    order: number;
}

export interface ResaleApartmentPrice {
    id: string;
    apartmentId: string;
    currencyId: string;
    priceTotal: number;
    priceByArea: number;
    currency?: ResaleCurrency;
}

export interface ResaleApartment {
    id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    gallery: any[];
    priceTotal: number;
    priceByArea: number;
    roomCount: number;
    area: number;
    floorFrom: number;
    floorTo: number;
    locationTitle?: string;
    locationUrl?: string;
    locationGoogleMapsUrl?: string;
    renovation?: string;
    kitchenSize?: number;
    wallMaterial?: string;
    attributeIds: string[];
    attributes?: ResaleAttribute[];
    requestIds: string[];
    apartmentTypeId: string;
    apartmentType?: ResaleApartmentType;
    ownerId?: string;
    owner?: ResaleOwner;
    prices?: ResaleApartmentPrice[];
    createdAt: string;
    updatedAt: string;
}

export interface ResaleApartmentListResponse {
    data: ResaleApartment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ResaleFilters {
    page?: number;
    limit?: number;
    apartmentTypeId?: string;
    city?: string;
    region?: string;
    purpose?: "sale" | "rent";
    mortgage?: boolean;
    extract?: boolean;
    ownerId?: string;
    minPrice?: number;
    maxPrice?: number;
    roomCount?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    currency?: string;
    viewOptionIds?: string;
    status?: string;
}
