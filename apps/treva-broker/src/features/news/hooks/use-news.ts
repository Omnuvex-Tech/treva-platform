"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { newsService } from "../api/news.service";
import type { NewsInput, NewsListQuery } from "../types";

export function useNewsList(query: NewsListQuery) {
    return useQuery({
        queryKey: queryKeys.news.list(query),
        queryFn: () => newsService.list(query),
        // Keeps the previous page on screen while the next one loads, so
        // paginating does not collapse the grid to a skeleton every click.
        placeholderData: (previous) => previous,
    });
}

export function useNewsPost(id: string | undefined) {
    return useQuery({
        queryKey: queryKeys.news.detail(id ?? ""),
        queryFn: () => newsService.detail(id!),
        enabled: Boolean(id),
    });
}

export function usePinnedNews() {
    return useQuery({
        queryKey: [...queryKeys.news.all, "pinned"],
        queryFn: () => newsService.pinned(),
    });
}

export function useNewsStats() {
    return useQuery({
        queryKey: queryKeys.news.stats,
        queryFn: () => newsService.stats(),
    });
}

export function useCreateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: NewsInput) => newsService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
        },
    });
}

export function useUpdateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<NewsInput> }) =>
            newsService.update(id, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
        },
    });
}

export function useDeleteNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => newsService.remove(id),
        onSuccess: () => {
            // Invalidating the whole `news` branch, not just the current page:
            // a delete shifts every subsequent page and changes the stats.
            void queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
        },
    });
}
