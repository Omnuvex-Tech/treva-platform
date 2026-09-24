/* eslint-disable @next/next/no-img-element -- the 40px folder glyph exported from the artboard */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type DragEvent } from "react";

import { isApiError } from "@/lib/api/errors";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { newsService } from "../api/news.service";
import { EditorCard, outlineButtonClass } from "./editor-card";

export interface CoverImageCardProps {
    coverImageUrl: string | null;
    onChange: (url: string | null) => void;
}

/**
 * Cover Image (873:51476): the `upload: drag upload` zone (382:13473) inside
 * 20px of padding — a dashed Border/Primary edge on the 16px radius, a 40px
 * folder glyph, an 18/Semibold title over the 16px format line, an "or" rule
 * and the 32px Select file button. Once a cover is chosen the zone gives way
 * to a preview of the same height.
 */
export function CoverImageCard({ coverImageUrl, onChange }: CoverImageCardProps) {
    const { t } = useI18n();
    const upload = t.common.upload;
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    // The mock adapter hands back object URLs, a document-lifetime allocation;
    // release the previous one whenever it is replaced or the card unmounts.
    useEffect(() => {
        const url = coverImageUrl;
        return () => {
            if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        };
    }, [coverImageUrl]);

    // The cover is stored first and only its URL goes into the post, so an
    // autosaved draft never points at a file that exists only in this tab.
    async function take(files: FileList | null) {
        const file = files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        setUploading(true);
        try {
            const stored = await newsService.upload(file);
            onChange(stored.url);
        } catch (error) {
            toast.error(
                isApiError(error) && error.status !== 0
                    ? error.message
                    : interpolate(upload.uploadFailed, { name: file.name }),
            );
        } finally {
            setUploading(false);
        }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        void take(event.dataTransfer.files);
    }

    return (
        <EditorCard iconSrc="/images/news/editor/heading-image.svg" title={t.news.editor.coverImage}>
            <div className="p-5">
                {coverImageUrl ? (
                    <div className="flex flex-col gap-3">
                        <div className="relative h-[217px] w-full overflow-hidden rounded-lg bg-bg-secondary">
                            <Image
                                src={coverImageUrl}
                                alt=""
                                fill
                                sizes="709px"
                                unoptimized={coverImageUrl.startsWith("blob:")}
                                className="object-cover"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => onChange(null)}
                                className={cn(outlineButtonClass, "h-8 px-[11px]")}
                            >
                                {t.news.editor.coverRemove}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={cn(
                            "relative flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-[23px] transition-colors",
                            dragging ? "border-border-brand bg-bg-secondary" : "border-border-primary",
                        )}
                    >
                        <img
                            src="/images/news/editor/folder-upload.svg"
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 shrink-0"
                        />

                        <div className="flex w-full flex-col items-center gap-2">
                            <div className="flex w-full flex-col items-center gap-[5px] text-center">
                                <p className="text-lg leading-6 font-semibold text-content-primary">
                                    {upload.dragDrop}
                                </p>
                                <p className="text-base leading-5 text-content-tertiary">{upload.formats}</p>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="flex w-[201px] items-center gap-3">
                                    <span aria-hidden className="h-[0.971px] min-w-px flex-1 bg-border-subtle" />
                                    <span className="text-base leading-5 font-semibold text-content-tertiary">
                                        {upload.or}
                                    </span>
                                    <span aria-hidden className="h-[0.971px] min-w-px flex-1 bg-border-subtle" />
                                </div>

                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => inputRef.current?.click()}
                                    className="flex h-8 items-center justify-center rounded-md bg-bg-brand px-4 text-sm leading-5 text-content-inverse transition-colors hover:bg-content-brand-bold disabled:opacity-60"
                                >
                                    {uploading ? upload.uploading : upload.selectFile}
                                </button>
                            </div>
                        </div>

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="sr-only"
                            onChange={(event) => {
                                void take(event.target.files);
                                event.target.value = "";
                            }}
                        />
                    </div>
                )}
            </div>
        </EditorCard>
    );
}
