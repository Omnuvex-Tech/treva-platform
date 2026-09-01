"use client";

import Image from "next/image";
import { Image01Icon, ImageUpload01Icon } from "@hugeicons/core-free-icons";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/ui/file-drop";
import { useI18n } from "@/providers/i18n-provider";
import { EditorSection } from "./editor-section";

export interface CoverImageCardProps {
    coverImageUrl: string | null;
    onChange: (url: string | null) => void;
}

/** Artboard 873:51475 — a 709x217 drop zone, replaced by a preview once set. */
export function CoverImageCard({ coverImageUrl, onChange }: CoverImageCardProps) {
    const { t } = useI18n();

    // Object URLs are a document-lifetime allocation; release the previous one
    // whenever it is replaced or the card unmounts.
    useEffect(() => {
        const url = coverImageUrl;
        return () => {
            if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        };
    }, [coverImageUrl]);

    return (
        <EditorSection icon={Image01Icon} title={t.news.editor.coverImage}>
            {coverImageUrl ? (
                <div className="flex flex-col gap-3">
                    <div className="relative aspect-[709/217] w-full overflow-hidden rounded-md bg-bg-secondary">
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
                        <Button variant="outline" size="sm" onClick={() => onChange(null)}>
                            {t.news.editor.coverRemove}
                        </Button>
                    </div>
                </div>
            ) : (
                <FileDrop
                    icon={ImageUpload01Icon}
                    title={t.news.editor.coverDrop}
                    hint={t.news.editor.coverHint}
                    accept="image/png,image/jpeg,image/webp"
                    minHeight={217}
                    onFiles={(files) => {
                        const file = files[0];
                        if (file) onChange(URL.createObjectURL(file));
                    }}
                />
            )}
        </EditorSection>
    );
}
