"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { projectsService } from "../api/projects.service";
import type { ProjectListQuery } from "../types";

export function useProjectsList(query: ProjectListQuery) {
    return useQuery({
        queryKey: queryKeys.projects.list(query),
        queryFn: () => projectsService.list(query),
        placeholderData: (previous) => previous,
    });
}

/** Backs the trash chip on a card (I873:49156;13198:74). */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectsService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        },
    });
}
