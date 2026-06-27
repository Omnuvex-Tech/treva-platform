import apiClient from "./client";

export interface Author {
    id: string;
    name: string;
    slug: string;
    title?: string;
    avatar?: string;
    description?: string;
    _count?: { articles: number };
    createdAt: string;
    updatedAt: string;
}

export interface CreateAuthorData {
    name: string;
    slug: string;
    title?: string;
    avatar?: string;
    description?: string;
}

export const authorsApi = {
    getAll: () => apiClient.get<Author[]>("/pulse/authors"),

    getById: (id: string) => apiClient.get<Author>(`/pulse/authors/${id}`),

    getBySlug: (slug: string) =>
        apiClient.get<Author>(`/pulse/authors/slug/${slug}`),

    create: (data: CreateAuthorData) =>
        apiClient.post<Author>("/pulse/authors", data),

    update: (id: string, data: CreateAuthorData) =>
        apiClient.patch<Author>(`/pulse/authors/${id}`, data),

    delete: (id: string) => apiClient.delete(`/pulse/authors/${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<{ url: string }>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
