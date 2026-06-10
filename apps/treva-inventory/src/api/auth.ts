import apiClient from "./client";

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
    };
}

export interface Admin {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export const authApi = {
    login: (data: LoginData) =>
        apiClient.post<LoginResponse>("/auth/login", data),

    getProfile: () => apiClient.get<Admin>("/auth/profile"),
};
