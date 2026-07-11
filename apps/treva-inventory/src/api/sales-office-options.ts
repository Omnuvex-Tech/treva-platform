import apiClient from "./client";

export interface SalesOfficeOption {
    id: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSalesOfficeOptionData {
    value: string;
    order?: number;
}

export interface UpdateSalesOfficeOptionData {
    value?: string;
    order?: number;
}

export const salesOfficeOptionsApi = {
    getAll: () => apiClient.get<SalesOfficeOption[]>("/sales-office-options"),

    getById: (id: string) => apiClient.get<SalesOfficeOption>(`/sales-office-options/${id}`),

    create: (data: CreateSalesOfficeOptionData) =>
        apiClient.post<SalesOfficeOption>("/sales-office-options", data),

    update: (id: string, data: UpdateSalesOfficeOptionData) =>
        apiClient.patch<SalesOfficeOption>(`/sales-office-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/sales-office-options/${id}`),
};
