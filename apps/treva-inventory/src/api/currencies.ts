import apiClient from "./client";

export interface Currency {
    id: string;
    name: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCurrencyData {
    name: string;
    value: string;
    order?: number;
}

export interface UpdateCurrencyData {
    name?: string;
    value?: string;
    order?: number;
}

export const currenciesApi = {
    getAll: () => apiClient.get<Currency[]>("/currencies"),

    getById: (id: string) => apiClient.get<Currency>(`/currencies/${id}`),

    create: (data: CreateCurrencyData) =>
        apiClient.post<Currency>("/currencies", data),

    update: (id: string, data: UpdateCurrencyData) =>
        apiClient.patch<Currency>(`/currencies/${id}`, data),

    delete: (id: string) => apiClient.delete(`/currencies/${id}`),
};
