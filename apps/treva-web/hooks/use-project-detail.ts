"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProjectDetail } from "@/lib/project-detail.types";

export function useProjectDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["project-detail", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const response = await api.get<ProjectDetail>(
        `/layihelerimiz/project-details/${slug}`
      );
      return response.data;
    },
    enabled: !!slug,
  });
}
