import apiClient from "./client";

export interface CategoryMetrics {
    houses: number;
    properties: number;
    reserved: number;
    sold: number;
    available: number;
}

export interface Category {
    id: string;
    title: string;
    name: string;
    slug: string;
    image?: string;
    status?: string;
    housesCount: number;
    propertiesCount: number;
    reservedCount: number;
    soldCount: number;
    objectType: string;
    propertyName?: string;
    currency: string;
    region?: string;
    area?: string;
    city?: string;
    developerBrand?: string;
    website?: string;
    fedLaw214: boolean;
    createdAt: string;
    updatedAt: string;
    metrics?: CategoryMetrics;
}

export interface CreateCategoryData {
    title: string;
    name: string;
    slug: string;
    image?: string;
    status?: string;
    housesCount?: number;
    propertiesCount?: number;
    reservedCount?: number;
    soldCount?: number;
    objectType?: string;
    propertyName?: string;
    currency?: string;
    region?: string;
    area?: string;
    city?: string;
    developerBrand?: string;
    website?: string;
    fedLaw214?: boolean;
}

export interface UpdateCategoryData {
    title?: string;
    name?: string;
    slug?: string;
    image?: string;
    status?: string;
    housesCount?: number;
    propertiesCount?: number;
    reservedCount?: number;
    soldCount?: number;
    objectType?: string;
    propertyName?: string;
    currency?: string;
    region?: string;
    area?: string;
    city?: string;
    developerBrand?: string;
    website?: string;
    fedLaw214?: boolean;
}

export interface UploadResponse {
    url: string;
    alt?: string;
    type?: string;
    originalName?: string;
    size?: number;
    mimetype?: string;
}

export const categoriesApi = {
    getAll: () => apiClient.get<Category[]>("/categories"),

    getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),

    getBySlug: (slug: string) =>
        apiClient.get<Category>(`/categories/slug/${slug}`),

    create: (data: CreateCategoryData) =>
        apiClient.post<Category>("/categories", data),

    update: (id: string, data: UpdateCategoryData) =>
        apiClient.patch<Category>(`/categories/${id}`, data),

    delete: (id: string) => apiClient.delete(`/categories/${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<UploadResponse>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
