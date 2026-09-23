"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { useI18n } from "@/providers/i18n-provider";
import type { AutosaveState } from "../hooks/use-autosave";
import { newsService } from "../api/news.service";
import { newsRichTextClass } from "../rich-text";
import { EditorCard, outlineButtonClass } from "./editor-card";

/**
 * The Tiptap editor treva-inventory writes its descriptions with, from
 * `@repo/ui`. Client-only: Tiptap builds its view during the first render and
 * refuses to on the server, so a blank block holds the space until it mounts
 * (toolbar + 360px body).
 */
const RichTextEditor = dynamic(() => import("@repo/ui").then((module) => module.RichTextEditor), {
    ssr: false,
    loading: () => <div className="h-[405px] w-full bg-bg-primary" />,
});

async function uploadMedia(file: File) {
    return (await newsService.upload(file)).url;
}

export interface NewsContentCardProps {
    body: string;
    onChange: (html: string) => void;
    autosave: AutosaveState;
}

/**
 * News Content (873:51488): a 28px Preview button in the header, the toolbar,
 * a 360px writing surface, and a 43px footer with the hint on the left and the
 * autosave state — 12/Regular on Content/Tertiary Inverse beside a 6px dot —
 * on the right.
 */
export function NewsContentCard({ body, onChange, autosave }: NewsContentCardProps) {
    const { t } = useI18n();
    const copy = t.news.editor;
    const [previewing, setPreviewing] = useState(false);

    return (
        <EditorCard
            iconSrc="/images/news/editor/heading-document.svg"
            title={copy.newsContent}
            action={
                <button
                    type="button"
                    aria-pressed={previewing}
                    onClick={() => setPreviewing((value) => !value)}
                    className={cn(outlineButtonClass, "h-7 px-[7px]", previewing && "bg-bg-secondary")}
                >
                    <AssetIcon src="/images/news/editor/eye.svg" size={16} />
                    {copy.preview}
                </button>
            }
        >
            {/* Preview shows the body the way the detail page renders it. The
                editor stays mounted underneath so its undo history survives. */}
            {previewing ? (
                <div
                    className={cn(newsRichTextClass, "min-h-[402px] px-5 py-4 text-content-primary")}
                    dangerouslySetInnerHTML={{ __html: body }}
                />
            ) : null}
            <RichTextEditor
                value={body}
                onChange={onChange}
                placeholder={copy.contentPlaceholder}
                minHeight={360}
                // Images, clips and slider pictures are stored before they go in,
                // so the body only ever holds /uploads URLs.
                onUploadImage={uploadMedia}
                // The card already draws the frame; drop the editor's own.
                className={cn("[&>div]:rounded-none [&>div]:border-0", previewing && "hidden")}
            />

            <div className="flex items-center justify-between border-t border-[var(--color-border-overlay)] bg-bg-primary px-5 py-3 text-xs leading-[18px] text-[var(--color-content-tertiary-inverse)]">
                <span>{copy.contentHint}</span>
                <span className="flex items-center gap-3">
                    {autosave === "saving" ? copy.saving : copy.autosaved}
                    <span
                        aria-hidden
                        className={cn(
                            "size-1.5 rounded-pill",
                            autosave === "saving" ? "bg-content-notice" : "bg-content-positive",
                        )}
                    />
                </span>
            </div>
        </EditorCard>
    );
}
