import apiClient from "./client";

export interface Attribute {
    id: string;
    name: string;
    title: string;
    value: string;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAttributeData {
    name: string;
    title: string;
    value: string;
    icon?: string;
}

export interface UpdateAttributeData {
    name?: string;
    title?: string;
    value?: string;
    icon?: string;
}

export const attributesApi = {
    getAll: () => apiClient.get<Attribute[]>("/attributes"),

    getById: (id: string) => apiClient.get<Attribute>(`/attributes/${id}`),

    create: (data: CreateAttributeData) =>
        apiClient.post<Attribute>("/attributes", data),

    update: (id: string, data: UpdateAttributeData) =>
        apiClient.patch<Attribute>(`/attributes/${id}`, data),

    delete: (id: string) => apiClient.delete(`/attributes/${id}`),
};
