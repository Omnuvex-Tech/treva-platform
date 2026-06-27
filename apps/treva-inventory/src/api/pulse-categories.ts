import apiClient from "./client";

export interface PulseCategory {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePulseCategoryData {
    name: string;
}

export const pulseCategoriesApi = {
    getAll: () => apiClient.get<PulseCategory[]>("/pulse/categories"),

    getById: (id: string) => apiClient.get<PulseCategory>(`/pulse/categories/${id}`),

    create: (data: CreatePulseCategoryData) =>
        apiClient.post<PulseCategory>("/pulse/categories", data),

    update: (id: string, data: CreatePulseCategoryData) =>
        apiClient.patch<PulseCategory>(`/pulse/categories/${id}`, data),

    delete: (id: string) => apiClient.delete(`/pulse/categories/${id}`),
};
