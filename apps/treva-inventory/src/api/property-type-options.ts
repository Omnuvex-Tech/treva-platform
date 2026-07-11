import apiClient from "./client";

export interface PropertyTypeOption {
    id: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropertyTypeOptionData {
    value: string;
}

export interface UpdatePropertyTypeOptionData {
    value?: string;
}

export const propertyTypeOptionsApi = {
    getAll: () => apiClient.get<PropertyTypeOption[]>("/property-type-options"),

    getById: (id: string) => apiClient.get<PropertyTypeOption>(`/property-type-options/${id}`),

    create: (data: CreatePropertyTypeOptionData) =>
        apiClient.post<PropertyTypeOption>("/property-type-options", data),

    update: (id: string, data: UpdatePropertyTypeOptionData) =>
        apiClient.patch<PropertyTypeOption>(`/property-type-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/property-type-options/${id}`),
};
