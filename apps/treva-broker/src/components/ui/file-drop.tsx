"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { useRef, useState, type DragEvent } from "react";

import { cn } from "@/lib/utils/cn";

export interface FileDropProps {
    icon: IconSvgElement;
    title: string;
    hint: string;
    accept?: string;
    multiple?: boolean;
    onFiles: (files: File[]) => void;
    /** Body height in px — 217 for Cover Image, 150 for Attachments. */
    minHeight?: number;
    className?: string;
}

/**
 * The `upload: drag upload` component from the design: a dashed drop zone that
 * is also a real file picker.
 *
 * The whole zone is a `<button>` wrapping a visually hidden `<input type=file>`
 * so it is reachable by keyboard — a div with an onClick would not be.
 */
export function FileDrop({
    icon,
    title,
    hint,
    accept,
    multiple = false,
    onFiles,
    minHeight = 217,
    className,
}: FileDropProps) {
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
                "relative flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors",
                dragging
                    ? "border-border-brand bg-bg-secondary"
                    : "border-border-tertiary bg-bg-primary",
                className,
            )}
            style={{ minHeight }}
        >
            <span className="flex size-9 items-center justify-center rounded-s bg-bg-secondary text-content-tertiary">
                <HugeiconsIcon icon={icon} size={15} strokeWidth={1.6} />
            </span>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-medium text-content-primary underline-offset-4 hover:underline"
            >
                {title}
            </button>

            <p className="text-xs text-content-tertiary">{hint}</p>

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
