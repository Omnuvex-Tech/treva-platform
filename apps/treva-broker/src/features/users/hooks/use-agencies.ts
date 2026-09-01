"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { agenciesService } from "../api/agencies.service";
import type { AgencyInput } from "../types";

const AGENCIES_KEY = ["agencies"] as const;

export function useAgencies(search: string) {
    return useQuery({
        queryKey: [...AGENCIES_KEY, "list", search],
        queryFn: () => agenciesService.list(search),
        placeholderData: (previous) => previous,
    });
}

export function useCreateAgency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: AgencyInput) => agenciesService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: AGENCIES_KEY });
        },
    });
}

export function useDeleteAgency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => agenciesService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: AGENCIES_KEY });
        },
    });
}
