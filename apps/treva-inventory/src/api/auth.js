import apiClient from "./client";
export const authApi = {
    login: (data) => apiClient.post("/auth/login", data),
    getProfile: () => apiClient.get("/auth/profile"),
};
