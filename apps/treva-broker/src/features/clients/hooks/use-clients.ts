"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { clientsService } from "../api/clients.service";
import type { ClientInput, ClientListQuery } from "../types";

export function useClientsList(query: ClientListQuery) {
    return useQuery({
        queryKey: queryKeys.clients.list(query),
        queryFn: () => clientsService.list(query),
        placeholderData: (previous) => previous,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ClientInput) => clientsService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
        },
    });
}

export function useUpdateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<ClientInput> }) =>
            clientsService.update(id, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
        },
    });
}

export function useDeleteClients() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: readonly string[]) =>
            ids.length === 1 ? clientsService.remove(ids[0]!) : clientsService.removeMany(ids),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
        },
    });
}
