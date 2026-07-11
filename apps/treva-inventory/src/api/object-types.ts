import apiClient from "./client";

export interface ObjectType {
  id: string;
  name: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectTypeData {
  name: string;
  title: string;
  slug: string;
}

export interface UpdateObjectTypeData {
  name?: string;
  title?: string;
  slug?: string;
}

export const objectTypesApi = {
  getAll: () => apiClient.get<ObjectType[]>("/object-types"),

  getById: (id: string) => apiClient.get<ObjectType>(`/object-types/${id}`),

  create: (data: CreateObjectTypeData) =>
    apiClient.post<ObjectType>("/object-types", data),

  update: (id: string, data: UpdateObjectTypeData) =>
    apiClient.patch<ObjectType>(`/object-types/${id}`, data),

  delete: (id: string) => apiClient.delete(`/object-types/${id}`),
};
