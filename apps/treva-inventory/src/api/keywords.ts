import apiClient from "./client";

export interface Keyword {
    id: string;
    name: string;
    slug: string;
    _count?: { articles: number };
    createdAt: string;
    updatedAt: string;
}

export interface CreateKeywordData {
    name: string;
    slug: string;
}

export const keywordsApi = {
    getAll: () => apiClient.get<Keyword[]>("/pulse/keywords"),

    create: (data: CreateKeywordData) =>
        apiClient.post<Keyword>("/pulse/keywords", data),

    update: (id: string, data: CreateKeywordData) =>
        apiClient.patch<Keyword>(`/pulse/keywords/${id}`, data),

    delete: (id: string) => apiClient.delete(`/pulse/keywords/${id}`),
};
