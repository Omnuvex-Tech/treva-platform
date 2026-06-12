import apiClient from "./client";

export interface ViewOption {
    id: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateViewOptionData {
    value: string;
    order?: number;
}

export const viewOptionsApi = {
    getAll: () => apiClient.get<ViewOption[]>("/view-options"),
    create: (data: CreateViewOptionData) => apiClient.post<ViewOption>("/view-options", data),
    update: (id: string, data: Partial<CreateViewOptionData>) =>
        apiClient.patch<ViewOption>(`/view-options/${id}`, data),
    delete: (id: string) => apiClient.delete(`/view-options/${id}`),
};
