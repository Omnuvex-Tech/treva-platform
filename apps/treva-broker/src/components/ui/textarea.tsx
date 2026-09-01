"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
    containerClassName?: string;
}

/** Multi-line variant of `Input`, sharing its grey-fill treatment. */
export function Textarea({
    label,
    hint,
    error,
    containerClassName,
    className,
    id,
    rows = 4,
    disabled,
    ...props
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <div className={cn("flex w-full flex-col", containerClassName)}>
            {label ? (
                <label
                    htmlFor={textareaId}
                    className="mb-0.5 text-xs leading-3 font-medium text-content-secondary"
                >
                    {label}
                </label>
            ) : null}

            <textarea
                id={textareaId}
                rows={rows}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                className={cn(
                    "w-full resize-y rounded-md bg-bg-secondary px-3 py-2.5 text-sm text-content-primary",
                    "border border-transparent outline-none transition-colors",
                    "placeholder:text-content-tertiary",
                    "focus:border-border-brand focus:bg-bg-primary",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    error && "border-content-negative",
                    className,
                )}
                {...props}
            />

            {error ? (
                <p className="mt-1.5 text-xs text-content-negative">{error}</p>
            ) : hint ? (
                <p className="mt-1.5 text-xs text-content-tertiary">{hint}</p>
            ) : null}
        </div>
    );
}
