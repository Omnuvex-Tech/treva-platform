/* eslint-disable @next/next/no-img-element -- the textarea's resize grip, exported from the artboard */
"use client";

import { useId } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/providers/i18n-provider";
import type { NewsCategory } from "../types";
import { EditorCard, EditorField, selectTriggerClass } from "./editor-card";

export interface BasicInformationCardProps {
    title: string;
    excerpt: string;
    category: NewsCategory | "";
    onChange: (patch: { title?: string; excerpt?: string; category?: NewsCategory }) => void;
}

/**
 * Basic Information (873:51458): a 36px title field, a 100px description box
 * with a resize grip, and the category select — 12px apart inside 20px of
 * padding. No character cap on the summary.
 */
export function BasicInformationCard({ title, excerpt, category, onChange }: BasicInformationCardProps) {
    const { t } = useI18n();
    const copy = t.news.editor;
    const titleId = useId();
    const excerptId = useId();
    const categoryId = useId();

    return (
        <EditorCard iconSrc="/images/news/editor/heading-document.svg" title={copy.basicInformation}>
            <div className="flex flex-col gap-3 p-5">
                <EditorField label={copy.titleLabel} htmlFor={titleId} required>
                    <Input
                        id={titleId}
                        surface="light"
                        size="sm"
                        placeholder={copy.titlePlaceholder}
                        value={title}
                        onChange={(event) => onChange({ title: event.target.value })}
                        required
                    />
                </EditorField>

                <EditorField label={copy.summaryLabel} htmlFor={excerptId} required>
                    {/* 873:51471 — the box, not the textarea, is what resizes, so
                        the grip stays pinned to its corner. */}
                    <div className="relative flex h-[100px] min-h-[100px] resize-y flex-col items-end overflow-hidden rounded-md border border-border-tertiary bg-bg-primary p-[11px] focus-within:border-border-brand [&::-webkit-resizer]:bg-transparent">
                        <textarea
                            id={excerptId}
                            value={excerpt}
                            placeholder={copy.summaryPlaceholder}
                            onChange={(event) => onChange({ excerpt: event.target.value })}
                            className="w-full flex-1 resize-none bg-transparent text-sm leading-5 text-content-primary outline-none placeholder:text-content-tertiary"
                        />
                        <img
                            src="/images/news/editor/resizer.svg"
                            alt=""
                            width={12}
                            height={12}
                            className="pointer-events-none absolute right-1 bottom-[5px] size-3"
                        />
                    </div>
                </EditorField>

                <EditorField label={copy.categoryLabel} htmlFor={categoryId} required>
                    <Select
                        id={categoryId}
                        value={category}
                        placeholder=""
                        onChange={(value) => onChange({ category: value as NewsCategory })}
                        options={[
                            { value: "news", label: t.news.categoryNews },
                            { value: "announcement", label: t.news.categoryAnnouncement },
                        ]}
                        className={selectTriggerClass}
                        icon={
                            <AssetIcon
                                src="/images/news/editor/select-chevron.svg"
                                size={20}
                                className="text-content-tertiary"
                            />
                        }
                    />
                </EditorField>
            </div>
        </EditorCard>
    );
}
