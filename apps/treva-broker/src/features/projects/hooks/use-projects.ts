"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { projectsService } from "../api/projects.service";
import type { ProjectInput, ProjectListQuery } from "../types";

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

export function useProject(id: string) {
    return useQuery({
        queryKey: queryKeys.projects.detail(id),
        queryFn: () => projectsService.detail(id),
    });
}

/**
 * Backs the editor's Save Changes button (873:51110).
 *
 * One hook for both screens: an empty id means the draft has never been saved,
 * which is exactly the create case, so the call site does not branch.
 */
export function useSaveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<ProjectInput> }) =>
            id ? projectsService.update(id, input) : projectsService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        },
    });
}
