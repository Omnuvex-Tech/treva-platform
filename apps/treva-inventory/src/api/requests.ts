import apiClient from "./client";

export interface Request {
    id: string;
    fullName: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRequestData {
    fullName: string;
    phoneNumber: string;
}

export interface UpdateRequestData {
    fullName?: string;
    phoneNumber?: string;
}

export const requestsApi = {
    getAll: () => apiClient.get<Request[]>("/requests"),

    getById: (id: string) => apiClient.get<Request>(`/requests/${id}`),

    create: (data: CreateRequestData) =>
        apiClient.post<Request>("/requests", data),

    update: (id: string, data: UpdateRequestData) =>
        apiClient.patch<Request>(`/requests/${id}`, data),

    delete: (id: string) => apiClient.delete(`/requests/${id}`),
};
