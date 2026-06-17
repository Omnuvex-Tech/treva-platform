import apiClient from "./client";

export interface ApartmentType {
    id: string;
    title: string;
    slug: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApartmentTypeData {
    title: string;
    slug: string;
    order?: number;
}

export interface UpdateApartmentTypeData {
    title?: string;
    slug?: string;
    order?: number;
}

export const apartmentTypesApi = {
    getAll: () => apiClient.get<ApartmentType[]>("/apartment-types"),

    getById: (id: string) => apiClient.get<ApartmentType>(`/apartment-types/${id}`),

    create: (data: CreateApartmentTypeData) =>
        apiClient.post<ApartmentType>("/apartment-types", data),

    update: (id: string, data: UpdateApartmentTypeData) =>
        apiClient.patch<ApartmentType>(`/apartment-types/${id}`, data),

    delete: (id: string) => apiClient.delete(`/apartment-types/${id}`),
};
