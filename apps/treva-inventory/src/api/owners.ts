import apiClient from "./client";

export interface Owner {
    id: string;
    firstName: string;
    lastName: string;
    profession: string | null;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOwnerData {
    firstName: string;
    lastName: string;
    profession?: string;
    phoneNumber: string;
}

export interface UpdateOwnerData {
    firstName?: string;
    lastName?: string;
    profession?: string;
    phoneNumber?: string;
}

export const ownersApi = {
    getAll: () => apiClient.get<Owner[]>("/owners"),

    getById: (id: string) => apiClient.get<Owner>(`/owners/${id}`),

    create: (data: CreateOwnerData) => apiClient.post<Owner>("/owners", data),

    update: (id: string, data: UpdateOwnerData) =>
        apiClient.patch<Owner>(`/owners/${id}`, data),

    delete: (id: string) => apiClient.delete(`/owners/${id}`),
};
