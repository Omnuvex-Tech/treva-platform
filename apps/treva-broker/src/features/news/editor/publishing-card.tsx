"use client";

import { useId } from "react";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useI18n } from "@/providers/i18n-provider";
import type { NewsLanguage } from "../types";
import { EditorField, EditorSideCard, selectTriggerClass } from "./editor-card";

export interface PublishingCardProps {
    publishDate: string;
    publishTime: string;
    language: NewsLanguage | "";
    expiryDate: string;
    onChange: (patch: {
        publishDate?: string;
        publishTime?: string;
        language?: NewsLanguage;
        expiryDate?: string;
    }) => void;
}

/** The 36px white field on Border/Subtle with a 16px glyph 8px in (`Input / TextInput Light`). */
const fieldClass = "h-9 gap-2 rounded-md border border-border-subtle bg-bg-primary px-[7px]";

const calendarIcon = (
    <AssetIcon src="/images/news/editor/calendar.svg" size={16} className="text-content-brand" />
);

/**
 * Publishing (873:51613): two 58px rows 8px apart, each split 12px apart —
 * Publish Date and Publish Time, then Language and Expiration Date.
 */
export function PublishingCard({ publishDate, publishTime, language, expiryDate, onChange }: PublishingCardProps) {
    const { t } = useI18n();
    const copy = t.news.editor;
    const ids = { date: useId(), time: useId(), language: useId(), expiry: useId() };

    return (
        <EditorSideCard title={copy.publishing}>
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-3">
                    <EditorField label={copy.publishDate} htmlFor={ids.date}>
                        <DatePicker
                            id={ids.date}
                            value={publishDate}
                            placeholder=""
                            onChange={(value) => onChange({ publishDate: value })}
                            leadingIcon={calendarIcon}
                            triggerClassName={fieldClass}
                        />
                    </EditorField>

                    <EditorField label={copy.publishTime} htmlFor={ids.time}>
                        <label
                            htmlFor={ids.time}
                            className={cn(
                                "flex cursor-text items-center focus-within:border-border-brand",
                                fieldClass,
                            )}
                        >
                            <AssetIcon src="/images/news/editor/time.svg" size={16} className="text-content-brand" />
                            <input
                                id={ids.time}
                                type="time"
                                value={publishTime}
                                onChange={(event) => onChange({ publishTime: event.target.value })}
                                className={cn(
                                    "h-full min-w-0 flex-1 bg-transparent text-sm leading-5 text-content-primary outline-none",
                                    "[&::-webkit-calendar-picker-indicator]:hidden",
                                    // An empty time field draws "--:--"; the artboard's is blank.
                                    !publishTime && "[&:not(:focus)]:text-transparent",
                                )}
                            />
                        </label>
                    </EditorField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <EditorField label={copy.language} htmlFor={ids.language}>
                        <Select
                            id={ids.language}
                            value={language}
                            placeholder=""
                            onChange={(value) => onChange({ language: value as NewsLanguage })}
                            options={LOCALES.map((code) => ({ value: code, label: LOCALE_LABELS[code].native }))}
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

                    <EditorField label={copy.expirationDate} htmlFor={ids.expiry}>
                        <DatePicker
                            id={ids.expiry}
                            value={expiryDate}
                            placeholder=""
                            min={publishDate || undefined}
                            onChange={(value) => onChange({ expiryDate: value })}
                            leadingIcon={calendarIcon}
                            triggerClassName={fieldClass}
                        />
                    </EditorField>
                </div>
            </div>
        </EditorSideCard>
    );
}
