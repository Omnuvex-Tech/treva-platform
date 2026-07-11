import apiClient from "./client";

export interface LocationOption {
    id: string;
    type: "region" | "city";
    name: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationOptionData {
    type: "region" | "city";
    name: string;
    title: string;
}

export interface UpdateLocationOptionData {
    type?: "region" | "city";
    name?: string;
    title?: string;
}

export const locationOptionsApi = {
    getAll: (type?: "region" | "city") =>
        apiClient.get<LocationOption[]>(type ? `/location-options?type=${type}` : "/location-options"),

    getById: (id: string) => apiClient.get<LocationOption>(`/location-options/${id}`),

    create: (data: CreateLocationOptionData) =>
        apiClient.post<LocationOption>("/location-options", data),

    update: (id: string, data: UpdateLocationOptionData) =>
        apiClient.patch<LocationOption>(`/location-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/location-options/${id}`),
};
