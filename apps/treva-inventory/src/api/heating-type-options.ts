import apiClient from "./client";

export interface HeatingTypeOption {
    id: string;
    name: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHeatingTypeOptionData {
    name: string;
    title: string;
}

export const heatingTypeOptionsApi = {
    getAll: () => apiClient.get<HeatingTypeOption[]>("/heating-type-options"),
    create: (data: CreateHeatingTypeOptionData) => apiClient.post<HeatingTypeOption>("/heating-type-options", data),
    update: (id: string, data: Partial<CreateHeatingTypeOptionData>) =>
        apiClient.patch<HeatingTypeOption>(`/heating-type-options/${id}`, data),
    delete: (id: string) => apiClient.delete(`/heating-type-options/${id}`),
};
