"use client";

import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AddFilesModal } from "@/components/common/add-files-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { routes } from "@/config/routes";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import {
    useCreateDocument,
    useDeleteDocument,
    useDocuments,
    useRegisterDownload,
} from "../hooks/use-documents";
import type { BrokerDocument } from "../types";
import { DocumentRow } from "./document-row";

/** Rows the loading card stands in for — the artboard draws four (873:49477). */
const SKELETON_ROWS = 4;

/**
 * Broker Role — the shared materials library (artboard 873:49451).
 *
 * Despite the nav label this screen is a file list. See features/brokers/types.ts.
 *
 * Two blocks, and no gap between them: a 60px headline whose 44px row is inset
 * 8px, then the card at y60 — the breathing room under the title is the
 * headline's own padding, not a margin. The 32px gutter both sit on is how the
 * artboard nests two 8px insets (Card Container 873:49470, Section 873:49471)
 * inside the content area's 16.
 *
 * The artboard draws no search here, unlike Clients (873:49757) which puts one
 * in its headline. The service still filters by name and uploader, so restoring
 * it is a matter of rendering the input and threading the term back into
 * `useDocuments` — nothing below this component had to change to drop it.
 *
 * Only the populated state is drawn. Loading, error and empty are kept from the
 * previous build and dressed to match, since a screen that renders nothing at
 * all while it fetches is not something the file is choosing against.
 */
export function BrokerRoleView() {
    const { locale, t } = useI18n();
    const router = useRouter();
    const { can, user } = useSession();

    const listQuery = useDocuments({});
    const registerDownload = useRegisterDownload();
    const deleteDocument = useDeleteDocument();
    const confirmDelete = useConfirm<BrokerDocument>();
    const createDocument = useCreateDocument();
    const toast = useToast();
    const [addOpen, setAddOpen] = useState(false);

    function handleDownload(document: BrokerDocument) {
        // With the mock adapter there is no file to fetch; the counter is still
        // incremented so the interaction is observable end to end.
        registerDownload.mutate(document.id);
        if (document.url) window.open(document.url, "_blank", "noopener");
    }

    /**
     * "Add Files" (873:49824) hands back one file and the name typed above it;
     * an untouched field falls back to the file's own name. The size cap is the
     * modal's own — it refuses without closing, so nothing arrives here that
     * the hint did not promise.
     */
    function handleAdd(file: File, name: string) {
        createDocument.mutate(
            { file, name, uploadedBy: user.fullName },
            {
                onSuccess: () => toast.success(t.brokerRole.addedToast),
                onError: () => toast.error(t.common.error),
            },
        );
    }

    function performDelete() {
        const document = confirmDelete.target;
        if (!document) return;

        deleteDocument.mutate(document.id, { onSettled: confirmDelete.dismiss });
    }

    const documents = listQuery.data ?? [];

    return (
        // The page chrome the artboard gives every screen (873:49468/873:49469):
        <div className="flex min-h-full bg-bg-secondary px-0.5">
            <div className="flex min-w-0 flex-1 flex-col bg-bg-primary/50 p-4">
                {/* Card Container (873:49470) and Section (873:49471): the two
                    8px insets the artboard nests inside the 16px content area,
                    which together are the 16px this one class is. */}
                <div className="flex min-w-0 flex-col px-4">
                    {/* 873:49472 — 60px tall, the action right, inset 8px. The artboard
                        repeats the screen title here (873:49474), but the header above
                        already carries it for real, so the second copy is dropped and
                        only the action is left. The row keeps its height either way:
                        it is what sets the gap above the card. */}
                    <div className="flex h-15 items-center justify-end gap-3 px-2">
                        {can("brokers:create") ? (
                            <Button
                                size="lg"
                                // 110x44 with a 3XL radius — the shared `lg` size rounds
                                // to 12px, this button is 16. The padding is 13, not the
                                // artboard's 14: Figma measures it from the frame edge,
                                // inside the 1px stroke, where CSS adds the border on top.
                                className="shrink-0 rounded-lg border border-border-inverse px-[13px]"
                                // Interface/Solid/plus (I873:49476;8272:10833) — a
                                // filled glyph, which no stroked npm icon reproduces.
                                leadingIcon={<AssetIcon src="/images/news/icon-plus.svg" size={16} />}
                                onClick={() => setAddOpen(true)}
                            >
                                {t.brokerRole.addFiles}
                            </Button>
                        ) : null}
                    </div>

                    {listQuery.isPending ? (
                        <Card className="divide-y divide-border-subtle px-2">
                            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                                <div key={index} className="flex h-15 items-center gap-3 px-4">
                                    <Skeleton className="size-7.5 rounded-sm" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                        <Skeleton className="h-3 w-40" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-7 w-72 rounded-lg" />
                                </div>
                            ))}
                        </Card>
                    ) : listQuery.isError ? (
                        <EmptyState
                            icon={<HugeiconsIcon icon={FolderOpenIcon} />}
                            title={t.common.error}
                            action={
                                <Button variant="outline" onClick={() => listQuery.refetch()}>
                                    {t.common.retry}
                                </Button>
                            }
                        />
                    ) : documents.length > 0 ? (
                        /* The rows are inset 8px inside the card and separated by a rule
                           that stops at that inset, not at the card edge (873:49477). */
                        <Card className="divide-y divide-border-subtle px-2">
                            {documents.map((document) => (
                                <DocumentRow
                                    key={document.id}
                                    document={document}
                                    onDownload={handleDownload}
                                    onEdit={(target) =>
                                        router.push(routes.brokerRoleEdit(locale, target.id))
                                    }
                                    onDelete={confirmDelete.ask}
                                />
                            ))}
                        </Card>
                    ) : (
                        <EmptyState
                            icon={<HugeiconsIcon icon={FolderOpenIcon} />}
                            title={t.common.empty}
                            description={t.common.emptyHint}
                        />
                    )}

                    {/* The modal is drawn beside this screen in the file
                        (873:49824), and its own defaults are what it draws:
                        the artboard's formats line, picker and 60MB cap. */}
                    <AddFilesModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />

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
            </div>
        </div>
    );
}
