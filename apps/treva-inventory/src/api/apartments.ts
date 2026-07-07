import apiClient from "./client";

export interface Apartment {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    gallery: any[];
    priceTotal: number;
    priceByArea: number;
    roomCount: number;
    area: number;
    floorFrom: number;
    floorTo: number;
    locationTitle: string | null;
    locationUrl: string | null;
    renovation: string | null;
    kitchenSize: number | null;
    wallMaterial: string | null;
    attributeIds: string[];
    requestIds: string[];
    status?: "active" | "pending" | "non-active";
    apartmentTypeId: string;
    apartmentType: { id: string; title: string } | null;
    ownerId: string | null;
    owner: { id: string; firstName: string; lastName: string; phoneNumber?: string } | null;
    currencyId: string | null;
    currency: { id: string; name: string; value: string } | null;
    prices: { id: string; currencyId: string; priceTotal: number; priceByArea: number; currency: { id: string; name: string; value: string } }[];
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
    title: string;
    slug: string;
    description?: string;
    image?: string;
    gallery?: any[];
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
    apartmentTypeId: string;
    ownerId?: string;
    attributeIds?: string[];
    requestIds?: string[];
    status?: "active" | "pending" | "non-active";
    currencyId?: string;
    prices?: { currencyId: string; priceTotal: number; priceByArea: number }[];
}

export interface UpdateApartmentData {
    title?: string;
    slug?: string;
    description?: string;
    image?: string;
    gallery?: any[];
    priceTotal?: number;
    priceByArea?: number;
    roomCount?: number;
    area?: number;
    floorFrom?: number;
    floorTo?: number;
    locationTitle?: string;
    locationUrl?: string;
    renovation?: string;
    kitchenSize?: number;
    wallMaterial?: string;
    apartmentTypeId?: string;
    ownerId?: string;
    attributeIds?: string[];
    requestIds?: string[];
    status?: "active" | "pending" | "non-active";
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
