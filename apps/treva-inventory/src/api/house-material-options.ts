import apiClient from "./client";

export interface HouseMaterialOption {
    id: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHouseMaterialOptionData {
    value: string;
}

export interface UpdateHouseMaterialOptionData {
    value?: string;
}

export const houseMaterialOptionsApi = {
    getAll: () => apiClient.get<HouseMaterialOption[]>("/house-material-options"),

    getById: (id: string) => apiClient.get<HouseMaterialOption>(`/house-material-options/${id}`),

    create: (data: CreateHouseMaterialOptionData) =>
        apiClient.post<HouseMaterialOption>("/house-material-options", data),

    update: (id: string, data: UpdateHouseMaterialOptionData) =>
        apiClient.patch<HouseMaterialOption>(`/house-material-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/house-material-options/${id}`),
};
