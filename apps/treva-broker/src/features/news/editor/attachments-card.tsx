/* eslint-disable @next/next/no-img-element -- the 15px paperclip exported from the artboard */
"use client";

import { Delete02Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState, type DragEvent } from "react";

import { AddFilesModal } from "@/components/common/add-files-modal";
import { AssetIcon } from "@/components/ui/asset-icon";
import { isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { newsService } from "../api/news.service";
import type { AttachmentKind, NewsAttachment } from "../types";
import { EditorCard, outlineButtonClass } from "./editor-card";

export interface AttachmentsCardProps {
    attachments: NewsAttachment[];
    onChange: (attachments: NewsAttachment[]) => void;
}

/** The design states the cap in the hint, so it is enforced here too. */
const MAX_BYTES = 25 * 1024 * 1024;

/** Matches `attachHint` — "PDF, Word, Excel, or Images". */
const ACCEPT = "image/*,application/pdf,.doc,.docx,.xls,.xlsx";

function kindFor(file: File): AttachmentKind {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (/\.docx?$/i.test(file.name)) return "doc";
    if (/\.xlsx?$/i.test(file.name)) return "sheet";
    return "other";
}

/**
 * Attachments (873:51594): a 32px Add File button in the header, and a 150px
 * dashed drop zone on the 14px radius — a 36px Background/Secondary tile with
 * the paperclip, "Attach files" in 14/Semibold, the limits in 12/Regular on
 * Content/Tertiary Inverse. What is already attached lists under it.
 */
export function AttachmentsCard({ attachments, onChange }: AttachmentsCardProps) {
    const { locale, t } = useI18n();
    const copy = t.news.editor;
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [pending, setPending] = useState(0);

    // Uploads finish after the render that started them; appending to the prop
    // they closed over would drop whatever landed in between.
    const latest = useRef(attachments);
    latest.current = attachments;

    /**
     * The one entry point that enforces the cap and stores the file, so the
     * header modal and the inline drop zone cannot drift apart on what they
     * accept. Only a stored file joins the list.
     */
    async function accept(file: File, name: string) {
        if (file.size > MAX_BYTES) {
            toast.error(interpolate(copy.tooLarge, { name: file.name }));
            return;
        }

        setPending((count) => count + 1);
        try {
            const stored = await newsService.upload(file);
            const entry: NewsAttachment = {
                id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                name: name || file.name,
                sizeBytes: stored.sizeBytes,
                kind: kindFor(file),
                url: stored.url,
            };

            latest.current = [...latest.current, entry];
            onChange(latest.current);
        } catch (error) {
            toast.error(
                isApiError(error) && error.status !== 0
                    ? error.message
                    : interpolate(t.common.upload.uploadFailed, { name: file.name }),
            );
        } finally {
            setPending((count) => count - 1);
        }
    }

    function addFiles(files: File[]) {
        for (const file of files) void accept(file, "");
    }

    function handleDrop(event: DragEvent<HTMLButtonElement>) {
        event.preventDefault();
        setDragging(false);
        addFiles(Array.from(event.dataTransfer.files));
    }

    return (
        <EditorCard
            iconSrc="/images/news/editor/heading-attachment.svg"
            title={copy.attachments}
            action={
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className={cn(outlineButtonClass, "h-8 px-[7px]")}
                >
                    <AssetIcon src="/images/news/icon-plus.svg" size={16} />
                    {copy.addFile}
                </button>
            }
        >
            {/* relative: the hidden file input is absolutely positioned and would
                otherwise anchor to <body> and stretch the document. */}
            <div className="relative flex flex-col gap-3 px-5 py-4">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                        "flex w-full flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed px-px py-8 transition-colors",
                        dragging ? "border-border-brand bg-bg-secondary" : "border-border-subtle bg-bg-primary",
                    )}
                >
                    <span className="flex size-9 items-center justify-center rounded-[14px] bg-bg-secondary">
                        <img src="/images/news/editor/attach.svg" alt="" width={15} height={15} className="size-[15px]" />
                    </span>
                    <span className="text-sm leading-5 font-semibold text-content-primary">{copy.attachFiles}</span>
                    <span className="pt-0.5 text-xs leading-[18px] text-[var(--color-content-tertiary-inverse)]">
                        {copy.attachHint}
                    </span>
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT}
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                        addFiles(Array.from(event.target.files ?? []));
                        event.target.value = "";
                    }}
                />

                {attachments.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-border-subtle rounded-md border border-border-subtle">
                        {attachments.map((attachment) => (
                            <li key={attachment.id} className="flex items-center gap-3 px-3 py-2.5">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-tertiary">
                                    <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={1.6} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-content-primary">{attachment.name}</p>
                                    <p className="text-xs text-content-tertiary">
                                        {formatBytes(attachment.sizeBytes, locale)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    aria-label={`${t.common.delete}: ${attachment.name}`}
                                    onClick={() =>
                                        onChange(attachments.filter((entry) => entry.id !== attachment.id))
                                    }
                                    className="flex size-8 items-center justify-center rounded-sm text-content-tertiary transition-colors hover:bg-bg-secondary hover:text-content-negative"
                                >
                                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {pending > 0 ? (
                    <p role="status" className="flex items-center gap-2 text-xs text-content-tertiary">
                        <span
                            aria-hidden
                            className="size-3 animate-spin rounded-pill border-2 border-current border-t-transparent"
                        />
                        {t.common.upload.uploading}
                    </p>
                ) : null}
            </div>

            <AddFilesModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onAdd={(file, name) => void accept(file, name)}
                hint={copy.attachHint}
                accept={ACCEPT}
                maxBytes={MAX_BYTES}
            />
        </EditorCard>
    );
}
