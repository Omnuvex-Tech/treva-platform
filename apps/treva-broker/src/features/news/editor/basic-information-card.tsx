"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/providers/i18n-provider";
import type { NewsCategory } from "../types";
import { EditorSection } from "./editor-section";

export interface BasicInformationCardProps {
    title: string;
    excerpt: string;
    category: NewsCategory;
    onChange: (patch: { title?: string; excerpt?: string; category?: NewsCategory }) => void;
}

/** Artboard 873:51457 — a title field, a summary field and the category select. */
export function BasicInformationCard({
    title,
    excerpt,
    category,
    onChange,
}: BasicInformationCardProps) {
    const { t } = useI18n();

    return (
        <EditorSection icon={InformationCircleIcon} title={t.news.editor.basicInformation}>
            <div className="flex flex-col gap-4">
                <Input
                    label={t.news.editor.titleLabel}
                    placeholder={t.news.editor.titlePlaceholder}
                    value={title}
                    onChange={(event) => onChange({ title: event.target.value })}
                    required
                />

                <Textarea
                    label={t.news.editor.summaryLabel}
                    placeholder={t.news.editor.summaryPlaceholder}
                    rows={3}
                    value={excerpt}
                    onChange={(event) => onChange({ excerpt: event.target.value })}
                />

                <Select
                    label={t.news.editor.categoryLabel}
                    value={category}
                    onChange={(value) => onChange({ category: value as NewsCategory })}
                    options={[
                        { value: "news", label: t.news.categoryNews },
                        { value: "announcement", label: t.news.categoryAnnouncement },
                    ]}
                />
            </div>
        </EditorSection>
    );
}
