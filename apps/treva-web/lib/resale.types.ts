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
    ownerId?: string;
    minPrice?: number;
    maxPrice?: number;
    roomCount?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
}
