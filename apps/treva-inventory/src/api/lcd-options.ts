import apiClient from "./client";

export interface LcdOption {
    id: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLcdOptionData {
    value: string;
    order?: number;
}

export interface UpdateLcdOptionData {
    value?: string;
    order?: number;
}

export const lcdOptionsApi = {
    getAll: () => apiClient.get<LcdOption[]>("/lcd-options"),

    getById: (id: string) => apiClient.get<LcdOption>(`/lcd-options/${id}`),

    create: (data: CreateLcdOptionData) =>
        apiClient.post<LcdOption>("/lcd-options", data),

    update: (id: string, data: UpdateLcdOptionData) =>
        apiClient.patch<LcdOption>(`/lcd-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/lcd-options/${id}`),
};
