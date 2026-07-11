import apiClient from "./client";

export interface RoomOption {
    id: string;
    name: string;
    title: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoomOptionData {
    name: string;
    title: string;
    type?: string;
}

export interface UpdateRoomOptionData {
    name?: string;
    title?: string;
    type?: string;
}

export const roomOptionsApi = {
    getAll: (type?: string) => apiClient.get<RoomOption[]>(`/room-options${type ? `?type=${encodeURIComponent(type)}` : ""}`),

    getById: (id: string) => apiClient.get<RoomOption>(`/room-options/${id}`),

    create: (data: CreateRoomOptionData) =>
        apiClient.post<RoomOption>("/room-options", data),

    update: (id: string, data: UpdateRoomOptionData) =>
        apiClient.patch<RoomOption>(`/room-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/room-options/${id}`),
};
