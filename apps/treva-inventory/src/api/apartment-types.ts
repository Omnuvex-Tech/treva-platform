import apiClient from "./client";

export interface ApartmentType {
    id: string;
    name: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApartmentTypeData {
    name: string;
    title: string;
}

export interface UpdateApartmentTypeData {
    name?: string;
    title?: string;
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
