"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { documentsService } from "../api/documents.service";
import type { DocumentListQuery, DocumentVisibility } from "../types";

export function useDocuments(query: DocumentListQuery) {
    return useQuery({
        queryKey: [...queryKeys.brokers.all, "documents", query],
        queryFn: () => documentsService.list(query),
        placeholderData: (previous) => previous,
    });
}

export function useSetVisibility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, visibility }: { id: string; visibility: DocumentVisibility }) =>
            documentsService.setVisibility(id, visibility),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.brokers.all });
        },
    });
}

export function useRegisterDownload() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => documentsService.registerDownload(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.brokers.all });
        },
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => documentsService.remove(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.brokers.all });
        },
    });
}
