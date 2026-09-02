"use client";

import { useRef, useState, type DragEvent, type SVGProps } from "react";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

/**
 * `Huge-icon/files and folder/outline/folder-upload 01`, inlined from the
 * artboard's own export (382:13514) rather than taken from
 * `@hugeicons/core-free-icons`.
 *
 * The free package ships a `FolderUploadIcon`, but it is a different glyph —
 * a closed folder with the arrow riding outside on the right, drawn at 1.5.
 * The design's is an open tray with the arrow centred inside it, at stroke 2.
 * Swapping one for the other would be a redraw, so the exported geometry is
 * kept verbatim and only `stroke` is opened up to `currentColor` so the icon
 * takes its colour from a token instead of the baked #1A1A1A.
 */
function FolderUploadGlyph(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
            <path
                d="M9 15L10.5858 13.4142C11.3668 12.6332 12.6332 12.6332 13.4142 13.4142L15 15M12 13V18M20 7V8H4V5C4 3.34315 5.34315 2 7 2H9.56917C10.2372 2 10.8862 2.22298 11.4131 2.6336L12.3535 3.3664C12.8805 3.77702 13.5294 4 14.1975 4H17C18.6569 4 20 5.34315 20 7ZM3.47397 8H20.526C21.7993 8 22.7484 9.17403 22.4816 10.4191L20.6775 18.8381C20.2823 20.6824 18.6525 22 16.7663 22H7.23366C5.34751 22 3.71766 20.6824 3.32245 18.8381L1.51837 10.4191C1.25158 9.17404 2.20069 8 3.47397 8Z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export interface UploadDropzoneProps {
    /** 16/Semibold headline — "Drag & drop here". */
    title: string;
    /** 14/Regular sub-line stating the accepted formats and the size cap. */
    hint: string;
    /** The word sitting between the two divider rules — "or". */
    orLabel: string;
    /** Label of the filled picker button — "Select file". */
    buttonLabel: string;
    accept?: string;
    multiple?: boolean;
    /**
     * The component's `showButton` variant. Off leaves drag-and-drop as the
     * only way in, so only turn it off where another control opens the picker.
     */
    showButton?: boolean;
    onFiles: (files: File[]) => void;
    className?: string;
}

/**
 * `upload: drag upload` (382:13475) — the dashed drop zone the modals draw.
 *
 * Not the same component as {@link FileDrop}: that one is the compact zone the
 * editor cards inline in their own body (873:51604), with a filled icon tile
 * and a text link. This is the standalone one — 24px bare icon, a two-line
 * instruction block, an "or" divider and a filled picker button — and the two
 * appear side by side in the file, so neither can be folded into the other.
 *
 * Dropping and picking are separate affordances on purpose: the zone itself is
 * the drop target, and the button is what a keyboard reaches. Wrapping the
 * whole zone in a button instead would swallow the button inside it.
 */
export function UploadDropzone({
    title,
    hint,
    orLabel,
    buttonLabel,
    accept,
    multiple = false,
    showButton = true,
    onFiles,
    className,
}: UploadDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);

        const files = Array.from(event.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
    }

    return (
        <div
            onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 transition-colors",
                dragging
                    ? "border-border-brand bg-bg-secondary"
                    : "border-border-primary bg-bg-primary",
                className,
            )}
        >
            <FolderUploadGlyph className="size-6 shrink-0 text-content-primary" />

            <div className="flex w-full flex-col items-center gap-2">
                {/* 5px between the two lines, not the 4px step — the artboard
                    sets it explicitly and the block is only 45px tall, so the
                    extra pixel is visible against the 20px line boxes. */}
                <div className="flex w-full flex-col items-center justify-center gap-1.25 text-center [word-break:break-word]">
                    <p className="w-full text-base font-semibold text-content-primary">{title}</p>
                    <p className="w-full text-sm text-content-tertiary">{hint}</p>
                </div>

                {showButton ? (
                    <div className="flex flex-col items-center gap-2">
                        {/* 201px in the artboard; the 200px step is the same
                            rule to the eye and keeps the width on the scale. */}
                        <div className="flex w-50 items-center gap-3">
                            <span className="h-px flex-1 bg-border-subtle" />
                            <span className="text-sm whitespace-nowrap text-content-tertiary">
                                {orLabel}
                            </span>
                            <span className="h-px flex-1 bg-border-subtle" />
                        </div>

                        <Button size="compact" onClick={() => inputRef.current?.click()}>
                            {buttonLabel}
                        </Button>
                    </div>
                ) : null}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="sr-only"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) onFiles(files);
                    // Reset so picking the same file twice still fires a change.
                    event.target.value = "";
                }}
            />
        </div>
    );
}
