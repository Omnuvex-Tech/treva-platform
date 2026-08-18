import apiClient from "./client";
import type { SectionPermission } from "./users";

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    admin: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        permissions: SectionPermission[];
    };
}

export interface Admin {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    permissions: SectionPermission[];
}

export const authApi = {
    login: (data: LoginData) =>
        apiClient.post<LoginResponse>("/auth/login", data),

    getProfile: () => apiClient.get<Admin>("/auth/profile"),
};
