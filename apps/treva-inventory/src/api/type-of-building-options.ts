import apiClient from "./client";

export interface TypeOfBuildingOption {
    id: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTypeOfBuildingOptionData {
    value: string;
    order?: number;
}

export interface UpdateTypeOfBuildingOptionData {
    value?: string;
    order?: number;
}

export const typeOfBuildingOptionsApi = {
    getAll: () => apiClient.get<TypeOfBuildingOption[]>("/type-of-building-options"),

    getById: (id: string) => apiClient.get<TypeOfBuildingOption>(`/type-of-building-options/${id}`),

    create: (data: CreateTypeOfBuildingOptionData) =>
        apiClient.post<TypeOfBuildingOption>("/type-of-building-options", data),

    update: (id: string, data: UpdateTypeOfBuildingOptionData) =>
        apiClient.patch<TypeOfBuildingOption>(`/type-of-building-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/type-of-building-options/${id}`),
};
