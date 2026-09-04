"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { documentsService } from "../api/documents.service";
import type {
    DocumentCreateInput,
    DocumentInput,
    DocumentListQuery,
} from "../types";

export function useDocuments(query: DocumentListQuery) {
    return useQuery({
        queryKey: [...queryKeys.brokers.all, "documents", query],
        queryFn: () => documentsService.list(query),
        placeholderData: (previous) => previous,
    });
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: [...queryKeys.brokers.all, "documents", id],
        queryFn: () => documentsService.detail(id),
    });
}

export function useCreateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DocumentCreateInput) => documentsService.create(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.brokers.all });
        },
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<DocumentInput> }) =>
            documentsService.update(id, input),
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
