import apiClient from "./client";

export interface StatusOption {
    id: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStatusOptionData {
    value: string;
}

export interface UpdateStatusOptionData {
    value?: string;
}

export const statusOptionsApi = {
    getAll: () => apiClient.get<StatusOption[]>("/status-options"),

    getById: (id: string) => apiClient.get<StatusOption>(`/status-options/${id}`),

    create: (data: CreateStatusOptionData) =>
        apiClient.post<StatusOption>("/status-options", data),

    update: (id: string, data: UpdateStatusOptionData) =>
        apiClient.patch<StatusOption>(`/status-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/status-options/${id}`),
};
