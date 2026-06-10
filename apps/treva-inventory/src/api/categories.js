import apiClient from "./client";
export const categoriesApi = {
    getAll: () => apiClient.get("/categories"),
    getById: (id) => apiClient.get(`/categories/${id}`),
    getBySlug: (slug) => apiClient.get(`/categories/slug/${slug}`),
    create: (data) => apiClient.post("/categories", data),
    update: (id, data) => apiClient.patch(`/categories/${id}`, data),
    delete: (id) => apiClient.delete(`/categories/${id}`),
};
