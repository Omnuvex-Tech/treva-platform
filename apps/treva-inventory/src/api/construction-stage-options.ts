import apiClient from "./client";

export interface ConstructionStageOption {
    id: string;
    value: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateConstructionStageOptionData {
    value: string;
    order?: number;
}

export interface UpdateConstructionStageOptionData {
    value?: string;
    order?: number;
}

export const constructionStageOptionsApi = {
    getAll: () => apiClient.get<ConstructionStageOption[]>("/construction-stage-options"),

    getById: (id: string) => apiClient.get<ConstructionStageOption>(`/construction-stage-options/${id}`),

    create: (data: CreateConstructionStageOptionData) =>
        apiClient.post<ConstructionStageOption>("/construction-stage-options", data),

    update: (id: string, data: UpdateConstructionStageOptionData) =>
        apiClient.patch<ConstructionStageOption>(`/construction-stage-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/construction-stage-options/${id}`),
};
