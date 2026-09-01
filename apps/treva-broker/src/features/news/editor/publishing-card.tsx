"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";

import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/providers/i18n-provider";
import { EditorSection } from "./editor-section";

export interface PublishingCardProps {
    publishDate: string;
    publishTime: string;
    expiryDate: string;
    expiryPolicy: string;
    authorName: string;
    onChange: (patch: Partial<Omit<PublishingCardProps, "onChange">>) => void;
}

/**
 * Artboard 873:51613 — a publish date/time row, an expiry date + policy row,
 * and the author field.
 */
export function PublishingCard({
    publishDate,
    publishTime,
    expiryDate,
    expiryPolicy,
    authorName,
    onChange,
}: PublishingCardProps) {
    const { t } = useI18n();

    return (
        <EditorSection icon={Calendar03Icon} title={t.news.editor.publishing}>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <DatePicker
                        label={t.news.editor.publishDate}
                        value={publishDate}
                        onChange={(publishDate) => onChange({ publishDate })}
                    />
                    <Input
                        type="time"
                        label={t.news.editor.publishTime}
                        value={publishTime}
                        onChange={(event) => onChange({ publishTime: event.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <DatePicker
                        label={t.news.editor.expiryDate}
                        value={expiryDate}
                        onChange={(expiryDate) => onChange({ expiryDate })}
                    />
                    <Select
                        label={t.news.editor.expiryPolicy}
                        value={expiryPolicy}
                        onChange={(expiryPolicy) => onChange({ expiryPolicy })}
                        options={[
                            { value: "keep", label: t.news.editor.expiryKeep },
                            { value: "archive", label: t.news.editor.expiryArchive },
                            { value: "delete", label: t.news.editor.expiryDelete },
                        ]}
                    />
                </div>

                <Input
                    label={t.news.editor.author}
                    value={authorName}
                    onChange={(event) => onChange({ authorName: event.target.value })}
                />
            </div>
        </EditorSection>
    );
}
