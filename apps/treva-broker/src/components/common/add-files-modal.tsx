"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";

/**
 * What the artboard's own hint promises. Defaults, not constants: the two
 * screens that open this modal accept different things, and the picker, the
 * hint and the cap have to be changed together or one of them starts lying.
 */
const DEFAULT_ACCEPT = "image/jpeg,image/png,application/pdf,video/mp4";
const DEFAULT_MAX_BYTES = 60 * 1024 * 1024;

export interface AddFilesModalProps {
    open: boolean;
    onClose: () => void;
    /**
     * Receives the picked file and the trimmed contents of the Name field —
     * empty when the field was left alone, in which case the caller should
     * fall back to the file's own name.
     */
    onAdd: (file: File, name: string) => void;
    /**
     * The formats-and-size line under the headline. Defaults to the artboard's
     * copy; pass the caller's own rule when it differs — and pass `accept` and
     * `maxBytes` to match, since this string is the promise they keep.
     */
    hint?: string;
    /** `accept` for the underlying picker. Must agree with `hint`. */
    accept?: string;
    /** Anything larger is refused without closing. Must agree with `hint`. */
    maxBytes?: number;
}

/**
 * `Modal` (873:49824) — a name for the upload, then the drop zone.
 *
 * The artboard sits immediately to the right of Broker Role (873:49451), which
 * is the screen whose `Add Files` button opens it. It is in `common/` rather
 * than under that feature because the Attachments card in the news editor
 * draws the same modal from its own `Add File` button (873:51602).
 *
 * One file per opening, not several: the artboard gives the modal a single
 * `Name` field, and a lone name cannot be shared across a multi-file pick
 * without inventing a numbering rule the design does not have. Batch drops
 * stay with the news card's own inline zone, which needs no name.
 *
 * ── Picking is not committing ────────────────────────────────────────────
 * The file is staged, and Enter sends it. Committing on the pick instead
 * would make the Name field unusable for the obvious order of operations:
 * choose the file, then name it. The field is still optional — Enter on an
 * untouched one sends the file under its own name.
 *
 * The artboard draws no submit control, so the parts that make an invisible
 * commit discoverable are additions: the staged-file row, the line naming the
 * key, and the screen-reader-only submit button that also makes Enter work in
 * browsers that do not apply implicit submission. Nothing visible moves.
 */
export function AddFilesModal({
    open,
    onClose,
    onAdd,
    hint,
    accept = DEFAULT_ACCEPT,
    maxBytes = DEFAULT_MAX_BYTES,
}: AddFilesModalProps) {
    const { locale, t } = useI18n();
    const nameRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    // A modal reopened after an add would otherwise still hold the last name,
    // the last file and a refusal from the previous opening.
    useEffect(() => {
        if (open) {
            setName("");
            setFile(null);
            setError("");
        }
    }, [open]);

    function handleFiles(files: File[]) {
        const picked = files[0];
        if (!picked) return;

        if (picked.size > maxBytes) {
            setFile(null);
            setError(
                interpolate(t.common.upload.tooLarge, {
                    name: picked.name,
                    limit: formatBytes(maxBytes, locale),
                }),
            );
            return;
        }

        setFile(picked);
        setError("");
        // Naming it is the only step left, so put the caret where it happens.
        nameRef.current?.focus();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!file) {
            setError(t.common.upload.selectFirst);
            return;
        }

        onAdd(file, name.trim());
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            variant="plain"
            // 600px in the artboard — off the `sm`/`md`/`lg` ladder, which
            // steps 448 / 672 / 896.
            className="max-w-150"
            title={t.common.upload.title}
            closeLabel={t.common.close}
        >
            {/* The 16px gap the artboard puts between its blocks, reproduced
                inside the form so wrapping them changes no spacing. */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    ref={nameRef}
                    surface="light"
                    size="sm"
                    label={t.common.upload.name}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <UploadDropzone
                        accept={accept}
                        title={t.common.upload.dragDrop}
                        hint={hint ?? t.common.upload.formats}
                        orLabel={t.common.upload.or}
                        buttonLabel={t.common.upload.selectFile}
                        onFiles={handleFiles}
                    />

                    {file ? (
                        <div className="flex items-center gap-2 rounded-md border border-border-subtle px-3 py-2">
                            <span className="min-w-0 flex-1 truncate text-sm text-content-primary">
                                {file.name}
                            </span>
                            <span className="shrink-0 text-xs text-content-tertiary">
                                {formatBytes(file.size, locale)}
                            </span>
                        </div>
                    ) : null}

                    {error ? (
                        <p role="alert" className="text-xs text-content-negative">
                            {error}
                        </p>
                    ) : file ? (
                        <p className="text-xs text-content-tertiary">{t.common.upload.enterToAdd}</p>
                    ) : null}
                </div>

                <button type="submit" className="sr-only">
                    {t.common.upload.title}
                </button>
            </form>
        </Modal>
    );
}
