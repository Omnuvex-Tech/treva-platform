import apiClient from "./client";

export interface SectionPermission {
    section: string;
    menuKeys: string[];
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    permissions: SectionPermission[];
}

export interface CreateUserData {
    email: string;
    password: string;
    name?: string;
    isActive?: boolean;
    permissions?: SectionPermission[];
}

export type UpdateUserData = Partial<CreateUserData>;

export const usersApi = {
    getAll: () => apiClient.get<User[]>("/users"),

    getById: (id: string) => apiClient.get<User>(`/users/${id}`),

    create: (data: CreateUserData) => apiClient.post<User>("/users", data),

    update: (id: string, data: UpdateUserData) =>
        apiClient.patch<User>(`/users/${id}`, data),

    delete: (id: string) => apiClient.delete(`/users/${id}`),
};
