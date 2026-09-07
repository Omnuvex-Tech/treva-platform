"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { usersService } from "../api/users.service";
import type { UserInput, UserListQuery } from "../types";

export function useUsersList(query: UserListQuery) {
    return useQuery({
        queryKey: queryKeys.users.list(query),
        queryFn: () => usersService.list(query),
        placeholderData: (previous) => previous,
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: () => usersService.detail(id),
    });
}

/**
 * The agency row under the agent editor (873:48887).
 *
 * Guarded on the id because the same screen creates accounts, where there is
 * nothing to look up yet.
 */
export function useUserAgencyLink(id: string) {
    return useQuery({
        queryKey: queryKeys.users.agencyLink(id),
        queryFn: () => usersService.agencyLink(id),
        enabled: id !== "",
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UserInput) => usersService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) =>
            usersService.update(id, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
