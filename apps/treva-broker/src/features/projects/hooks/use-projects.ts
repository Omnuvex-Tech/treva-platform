"use client";

import { useQuery } from "@tanstack/react-query";

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
