"use client";

import { FolderOpen, Search, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import {
    useDeleteDocument,
    useDocuments,
    useRegisterDownload,
} from "../hooks/use-documents";
import type { BrokerDocument } from "../types";
import { DocumentRow } from "./document-row";

/**
 * Broker Role — the shared materials library.
 *
 * Despite the nav label this screen is a file list, exactly as drawn in
 * artboard 873:49451. See features/brokers/types.ts.
 */
export function BrokerRoleView() {
    const { t } = useI18n();
    const { can } = useSession();

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 300);

    const listQuery = useDocuments({ search: debouncedSearch });
    const registerDownload = useRegisterDownload();
    const deleteDocument = useDeleteDocument();
    const confirmDelete = useConfirm<BrokerDocument>();

    function handleDownload(document: BrokerDocument) {
        // With the mock adapter there is no file to fetch; the counter is still
        // incremented so the interaction is observable end to end.
        registerDownload.mutate(document.id);
        if (document.url) window.open(document.url, "_blank", "noopener");
    }

    function performDelete() {
        const document = confirmDelete.target;
        if (!document) return;

        deleteDocument.mutate(document.id, { onSettled: confirmDelete.dismiss });
    }

    const documents = listQuery.data ?? [];

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-content-tertiary">
                    {interpolate(t.brokerRole.count, { total: documents.length })}
                </p>

                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t.brokerRole.searchPlaceholder}
                        aria-label={t.brokerRole.searchPlaceholder}
                        leadingIcon={<Search />}
                        containerClassName="w-70"
                    />

                    {can("brokers:create") ? (
                        <Button leadingIcon={<Upload />}>{t.brokerRole.upload}</Button>
                    ) : null}
                </div>
            </div>

            {listQuery.isPending ? (
                <Card className="divide-y divide-border-subtle">
                    {Array.from({ length: 4 }, (_, index) => (
                        <div key={index} className="flex h-15 items-center gap-3 px-4">
                            <Skeleton className="size-7.5 rounded-s" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-7 w-64" />
                        </div>
                    ))}
                </Card>
            ) : listQuery.isError ? (
                <EmptyState
                    icon={<FolderOpen />}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => listQuery.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : documents.length > 0 ? (
                <Card className="divide-y divide-border-subtle">
                    {documents.map((document) => (
                        <DocumentRow
                            key={document.id}
                            document={document}
                            onDownload={handleDownload}
                            onDelete={confirmDelete.ask}
                        />
                    ))}
                </Card>
            ) : (
                <EmptyState
                    icon={<FolderOpen />}
                    title={t.common.empty}
                    description={t.common.emptyHint}
                />
            )}

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.brokerRole.deleteConfirm}
                subject={confirmDelete.target?.name}
                confirmLabel={t.common.confirmDelete}
                loading={deleteDocument.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
