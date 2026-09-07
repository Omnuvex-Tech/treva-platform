"use client";

import {
    Add01Icon,
    Attachment01Icon,
    Delete02Icon,
    File01Icon,
    FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { AddFilesModal } from "@/components/common/add-files-modal";
import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/ui/file-drop";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import type { AttachmentKind, NewsAttachment } from "../types";
import { EditorSection } from "./editor-section";

export interface AttachmentsCardProps {
    attachments: NewsAttachment[];
    onChange: (attachments: NewsAttachment[]) => void;
}

/** The design states the cap in the hint, so it is enforced here too. */
const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Matches `attachHint` — "PDF, Word, Excel, or Images". The shared modal
 * defaults to the wider set its own artboard names (JPEG/PNG/PDF/MP4, 60MB),
 * which is Broker Role's rule, not this card's.
 */
const ACCEPT = "image/*,application/pdf,.doc,.docx,.xls,.xlsx";

function kindFor(file: File): AttachmentKind {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (/\.docx?$/i.test(file.name)) return "doc";
    if (/\.xlsx?$/i.test(file.name)) return "sheet";
    return "other";
}

/** Artboard 873:51593 — a drop zone plus the list of what is already attached. */
export function AttachmentsCard({ attachments, onChange }: AttachmentsCardProps) {
    const { locale, t } = useI18n();
    const toast = useToast();
    const [addOpen, setAddOpen] = useState(false);

    /**
     * The one entry point that enforces the cap, so the header modal and the
     * inline drop zone cannot drift apart on what they accept.
     */
    function accept(file: File, name: string): NewsAttachment | null {
        if (file.size > MAX_BYTES) {
            toast.error(interpolate(t.news.editor.tooLarge, { name: file.name }));
            return null;
        }

        return {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: name || file.name,
            sizeBytes: file.size,
            kind: kindFor(file),
        };
    }

    function addFiles(files: File[]) {
        const accepted = files
            .map((file) => accept(file, ""))
            .filter((entry): entry is NewsAttachment => entry !== null);

        if (accepted.length) onChange([...attachments, ...accepted]);
    }

    /** The header modal's single, optionally renamed file. */
    function addNamedFile(file: File, name: string) {
        const entry = accept(file, name);
        if (entry) onChange([...attachments, entry]);
    }

    return (
        <EditorSection
            icon={Attachment01Icon}
            title={t.news.editor.attachments}
            action={
                <Button
                    variant="brandOutline"
                    // The 32px form of `chip` — 873:51602 keeps the 3XL radius
                    // and the 8px padding but stands a step taller.
                    size="chip"
                    className="h-8"
                    leadingIcon={<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />}
                    onClick={() => setAddOpen(true)}
                >
                    {t.news.editor.addFile}
                </Button>
            }
        >
            <div className="flex flex-col gap-3">
                <FileDrop
                    icon={FileUploadIcon}
                    title={t.news.editor.attachFiles}
                    hint={t.news.editor.attachHint}
                    multiple
                    minHeight={150}
                    onFiles={addFiles}
                />

                {attachments.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-border-subtle rounded-md border border-border-subtle">
                        {attachments.map((attachment) => (
                            <li key={attachment.id} className="flex items-center gap-3 px-3 py-2.5">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-tertiary">
                                    <HugeiconsIcon icon={File01Icon} size={15} strokeWidth={1.6} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-content-primary">
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-content-tertiary">
                                        {formatBytes(attachment.sizeBytes, locale)}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="iconSm"
                                    aria-label={`${t.common.delete}: ${attachment.name}`}
                                    onClick={() =>
                                        onChange(
                                            attachments.filter((entry) => entry.id !== attachment.id),
                                        )
                                    }
                                    className="text-content-tertiary hover:text-content-negative"
                                >
                                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <AddFilesModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onAdd={addNamedFile}
                hint={t.news.editor.attachHint}
                accept={ACCEPT}
                maxBytes={MAX_BYTES}
            />
        </EditorSection>
    );
}
