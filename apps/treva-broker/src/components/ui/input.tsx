"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    hint?: string;
    error?: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    containerClassName?: string;
}

/**
 * The `Input / TextInput Light` component from the design: grey fill, no
 * visible border at rest, 12px radius, optional leading icon.
 */
export function Input({
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    containerClassName,
    className,
    id,
    disabled,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
        <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
            {label ? (
                <label htmlFor={inputId} className="text-xs font-medium text-content-secondary">
                    {label}
                </label>
            ) : null}

            <div
                className={cn(
                    "flex items-center gap-2 rounded-md bg-bg-secondary px-3 transition-colors",
                    "border border-transparent",
                    "focus-within:border-border-brand focus-within:bg-bg-primary",
                    error && "border-content-negative",
                    disabled && "opacity-60",
                )}
            >
                {leadingIcon ? (
                    <span className="flex shrink-0 items-center text-content-tertiary [&_svg]:size-4">
                        {leadingIcon}
                    </span>
                ) : null}

                <input
                    id={inputId}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        "h-11 w-full min-w-0 bg-transparent text-sm text-content-primary outline-none",
                        "placeholder:text-content-tertiary",
                        "disabled:cursor-not-allowed",
                        className,
                    )}
                    {...props}
                />

                {trailingIcon ? (
                    <span className="flex shrink-0 items-center text-content-tertiary [&_svg]:size-4">
                        {trailingIcon}
                    </span>
                ) : null}
            </div>

            {error ? (
                <p id={`${inputId}-error`} className="text-xs text-content-negative">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${inputId}-hint`} className="text-xs text-content-tertiary">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
