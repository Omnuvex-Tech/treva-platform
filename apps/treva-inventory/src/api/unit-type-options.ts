import apiClient from "./client";

export interface UnitTypeOption {
    id: string;
    name: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitTypeOptionData {
    name: string;
    title: string;
}

export interface UpdateUnitTypeOptionData {
    name?: string;
    title?: string;
}

export const unitTypeOptionsApi = {
    getAll: () => apiClient.get<UnitTypeOption[]>("/unit-type-options"),

    getById: (id: string) => apiClient.get<UnitTypeOption>(`/unit-type-options/${id}`),

    create: (data: CreateUnitTypeOptionData) =>
        apiClient.post<UnitTypeOption>("/unit-type-options", data),

    update: (id: string, data: UpdateUnitTypeOptionData) =>
        apiClient.patch<UnitTypeOption>(`/unit-type-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/unit-type-options/${id}`),
};
