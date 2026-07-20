import apiClient from "./client";

export type ApartmentRenovation = "renovated" | "non-renovated";
export type ApartmentFurnishing = "furnished" | "unfurnished";

export interface Apartment {
    id: string;
    name: string | null;
    title: string;
    slug: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    canonicalUrl: string | null;
    seoImage: string | null;
    image: string | null;
    coverImage: string | null;
    gallery: any[];
    priceTotal: number;
    priceByArea: number;
    roomCount: number;
    area: number;
    grossArea: number | null;
    floorFrom: number;
    floorTo: number;
    bathroomCount: number | null;
    purpose: "sale" | "rent";
    region: string | null;
    city: string | null;
    locationTitle: string | null;
    locationUrl: string | null;
    locationGoogleMapsUrl: string | null;
    renovation: ApartmentRenovation | null;
    mortgage: boolean | null;
    extract: boolean | null;
    parking: boolean | null;
    buildingAge: number | null;
    furnishing: ApartmentFurnishing | null;
    elevator: boolean | null;
    ceilingHeight: number | null;
    heatingTypeIds: string[];
    heatingTypes: { id: string; name: string; title: string }[];
    viewOptionIds: string[];
    viewOptions: { id: string; name: string; title: string }[];
    attributeIds: string[];
    requestIds: string[];
    status?: "active" | "reserved" | "sold";
    apartmentTypeId: string;
    apartmentType: { id: string; title: string } | null;
    ownerId: string | null;
    owner: { id: string; firstName: string; lastName: string; phoneNumber?: string } | null;
    currencyId: string | null;
    currency: { id: string; name: string; title: string; value: string } | null;
    prices: { id: string; currencyId: string; priceTotal: number; priceByArea: number; currency: { id: string; name: string; title: string; value: string } }[];
    createdAt: string;
    updatedAt: string;
}

export interface ApartmentListResponse {
    data: Apartment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateApartmentData {
    name?: string;
    title: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    image?: string;
    coverImage?: string;
    gallery?: any[];
    priceTotal: number;
    priceByArea: number;
    roomCount: number;
    area: number;
    grossArea?: number;
    floorFrom: number;
    floorTo: number;
    bathroomCount?: number;
    purpose?: "sale" | "rent";
    region?: string;
    city?: string;
    locationTitle?: string;
    locationUrl?: string;
    locationGoogleMapsUrl?: string;
    renovation?: ApartmentRenovation;
    mortgage?: boolean;
    extract?: boolean;
    parking?: boolean;
    buildingAge?: number;
    furnishing?: ApartmentFurnishing;
    elevator?: boolean;
    ceilingHeight?: number;
    heatingTypeIds?: string[];
    viewOptionIds?: string[];
    apartmentTypeId: string;
    ownerId?: string;
    attributeIds?: string[];
    requestIds?: string[];
    status?: "active" | "reserved" | "sold";
    currencyId?: string;
    prices?: { currencyId: string; priceTotal: number; priceByArea: number }[];
}

export interface UpdateApartmentData {
    name?: string;
    title?: string;
    slug?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    image?: string;
    coverImage?: string;
    gallery?: any[];
    priceTotal?: number;
    priceByArea?: number;
    roomCount?: number;
    area?: number;
    grossArea?: number;
    floorFrom?: number;
    floorTo?: number;
    bathroomCount?: number;
    purpose?: "sale" | "rent";
    region?: string;
    city?: string;
    locationTitle?: string;
    locationUrl?: string;
    locationGoogleMapsUrl?: string;
    renovation?: ApartmentRenovation;
    mortgage?: boolean;
    extract?: boolean;
    parking?: boolean;
    buildingAge?: number;
    furnishing?: ApartmentFurnishing;
    elevator?: boolean;
    ceilingHeight?: number;
    heatingTypeIds?: string[];
    viewOptionIds?: string[];
    apartmentTypeId?: string;
    ownerId?: string;
    attributeIds?: string[];
    requestIds?: string[];
    status?: "active" | "reserved" | "sold";
    currencyId?: string;
    prices?: { currencyId: string; priceTotal: number; priceByArea: number }[];
}

export interface ApartmentFilters {
    page?: number;
    limit?: number;
    search?: string;
    apartmentTypeId?: string;
    ownerId?: string;
    minPrice?: number;
    maxPrice?: number;
    roomCount?: number;
    minArea?: number;
    maxArea?: number;
    minGrossArea?: number;
    maxGrossArea?: number;
    floor?: number;
    currency?: string;
    viewOptionIds?: string;
    status?: "active" | "reserved" | "sold";
}

export interface UploadResponse {
    url: string;
    alt?: string;
    type?: string;
    originalName?: string;
    size?: number;
    mimetype?: string;
}

export const apartmentsApi = {
    getAll: (filters?: ApartmentFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    params.append(key, String(value));
                }
            });
        }
        const query = params.toString();
        return apiClient.get<ApartmentListResponse>(
            `/apartments${query ? `?${query}` : ""}`
        );
    },

    getById: (id: string) => apiClient.get<Apartment>(`/apartments/${id}`),

    getBySlug: (slug: string) =>
        apiClient.get<Apartment>(`/apartments/slug/${slug}`),

    create: (data: CreateApartmentData) =>
        apiClient.post<Apartment>("/apartments", data),

    update: (id: string, data: UpdateApartmentData) =>
        apiClient.patch<Apartment>(`/apartments/${id}`, data),

    delete: (id: string) => apiClient.delete(`/apartments/${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<UploadResponse>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
