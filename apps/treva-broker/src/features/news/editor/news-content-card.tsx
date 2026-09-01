"use client";

import { CheckmarkCircle02Icon, File01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useI18n } from "@/providers/i18n-provider";
import type { AutosaveState } from "../hooks/use-autosave";
import { EditorSection } from "./editor-section";

export interface NewsContentCardProps {
    body: string;
    onChange: (html: string) => void;
    autosave: AutosaveState;
}

/**
 * Artboard 873:51487 — a 68px toolbar over a 360px editing surface, with the
 * autosave indicator on the footer row.
 */
export function NewsContentCard({ body, onChange, autosave }: NewsContentCardProps) {
    const { t } = useI18n();

    return (
        <EditorSection
            icon={File01Icon}
            title={t.news.editor.newsContent}
            bodyClassName="px-0 pb-0"
        >
            <div className="border-t border-border-subtle">
                <RichTextEditor
                    value={body}
                    onChange={onChange}
                    placeholder={t.news.editor.contentPlaceholder}
                    ariaLabel={t.news.editor.newsContent}
                    minHeight={360}
                />
            </div>

            <div className="flex h-11 items-center justify-between gap-3 border-t border-border-subtle px-4 text-xs text-content-tertiary">
                <span>{t.news.editor.contentHint}</span>

                <span className="inline-flex items-center gap-1.5">
                    {autosave === "saving" ? (
                        <>
                            <HugeiconsIcon
                                icon={Loading03Icon}
                                size={14}
                                strokeWidth={1.8}
                                className="animate-spin"
                            />
                            {t.news.editor.saving}
                        </>
                    ) : autosave === "saved" ? (
                        <>
                            <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                size={14}
                                strokeWidth={1.8}
                                className="text-content-positive"
                            />
                            {t.news.editor.autosaved}
                        </>
                    ) : null}
                </span>
            </div>
        </EditorSection>
    );
}
