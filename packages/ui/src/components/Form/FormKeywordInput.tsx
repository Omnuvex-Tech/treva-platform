"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { cn } from "../../lib/utils";

interface FormKeywordInputProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    required?: boolean;
    placeholder?: string;
    addButtonLabel?: string;
    className?: string;
}

function normalizeKeyword(value: string) {
    return value.trim().replace(/\s+/g, " ");
}

function parseKeywords(value: string) {
    return value
        .split(/[,\n]/)
        .map(normalizeKeyword)
        .filter(Boolean);
}

export function FormKeywordInput({
    label,
    value,
    onChange,
    required,
    placeholder = "Type keyword and press Enter",
    addButtonLabel = "Add",
    className,
}: FormKeywordInputProps) {
    const [draft, setDraft] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const keywords = useMemo(() => value.filter(Boolean), [value]);

    const commitKeywords = (items: string[]) => {
        const next = items
            .map(normalizeKeyword)
            .filter(Boolean)
            .filter((item, index, arr) => arr.findIndex((entry) => entry.toLowerCase() === item.toLowerCase()) === index);

        onChange(next);
    };

    const handleAdd = () => {
        const nextItems = parseKeywords(draft);
        if (nextItems.length === 0) return;
        commitKeywords([...keywords, ...nextItems]);
        setDraft("");
    };

    const handleDelete = (index: number) => {
        commitKeywords(keywords.filter((_, itemIndex) => itemIndex !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditingValue("");
        }
    };

    const handleEditStart = (index: number) => {
        setEditingIndex(index);
        setEditingValue(keywords[index] || "");
    };

    const handleEditSave = () => {
        if (editingIndex === null) return;

        const normalized = normalizeKeyword(editingValue);
        if (!normalized) {
            handleDelete(editingIndex);
            return;
        }

        const next = [...keywords];
        next[editingIndex] = normalized;
        commitKeywords(next);
        setEditingIndex(null);
        setEditingValue("");
    };

    const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleAdd();
        }
    };

    const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleEditSave();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            setEditingIndex(null);
            setEditingValue("");
        }
    };

    return (
        <div className={cn("flex flex-col", className)}>
            <label
                className="mb-1 block text-xs font-semibold text-[#333333]"
                style={{ lineHeight: "18px" }}
            >
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>

            <div className="rounded-xl border border-gray-200 bg-[#F4F5F6] p-3 transition-colors focus-within:border-gray-400 focus-within:bg-white">
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => {
                        const isEditing = editingIndex === index;

                        return (
                            <div
                                key={`${keyword}-${index}`}
                                className="flex items-center gap-1 rounded-full border border-[#D7DCE4] bg-white px-2 py-1 shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
                            >
                                {isEditing ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editingValue}
                                        onChange={(event) => setEditingValue(event.target.value)}
                                        onBlur={handleEditSave}
                                        onKeyDown={handleEditKeyDown}
                                        className="bg-transparent text-xs text-[#1A1A1A] outline-none"
                                        style={{ lineHeight: "18px" }}
                                        size={Math.max(editingValue.length, keyword.length, 4)}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleEditStart(index)}
                                        className="cursor-pointer text-xs font-medium text-[#243042]"
                                        style={{ lineHeight: "18px" }}
                                    >
                                        {keyword}
                                    </button>
                                )}

                                {!isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => handleEditStart(index)}
                                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#7B8190] transition-colors hover:bg-[#EEF1F5] hover:text-[#243042]"
                                        aria-label={`Edit ${keyword}`}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleDelete(index)}
                                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#7B8190] transition-colors hover:bg-[#FCECEC] hover:text-[#C3362B]"
                                    aria-label={`Delete ${keyword}`}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className={cn("mt-3 flex gap-2", keywords.length === 0 && "mt-0")}>
                    <input
                        type="text"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleDraftKeyDown}
                        placeholder={placeholder}
                        className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#1A1A1A] placeholder-[#999] outline-none transition-colors focus:border-gray-400"
                        style={{ lineHeight: "20px" }}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="h-10 cursor-pointer rounded-xl bg-[#4E525D] px-4 text-sm font-medium text-white transition-colors hover:opacity-90"
                    >
                        {addButtonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
