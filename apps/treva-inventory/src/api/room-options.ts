import apiClient from "./client";

export interface RoomOption {
    id: string;
    value: string;
    type: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoomOptionData {
    value: string;
    type?: string;
    order?: number;
}

export interface UpdateRoomOptionData {
    value?: string;
    type?: string;
    order?: number;
}

export const roomOptionsApi = {
    getAll: () => apiClient.get<RoomOption[]>("/room-options"),

    getById: (id: string) => apiClient.get<RoomOption>(`/room-options/${id}`),

    create: (data: CreateRoomOptionData) =>
        apiClient.post<RoomOption>("/room-options", data),

    update: (id: string, data: UpdateRoomOptionData) =>
        apiClient.patch<RoomOption>(`/room-options/${id}`, data),

    delete: (id: string) => apiClient.delete(`/room-options/${id}`),
};
