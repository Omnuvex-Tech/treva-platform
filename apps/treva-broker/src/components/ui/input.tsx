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
    /**
     * `filled` is the grey field used inside pages; `outlined` is the white,
     * bordered field the app header uses. Both appear in the artboards.
     */
    surface?: "filled" | "outlined";
}

/**
 * The `Input / TextInput Light` component from the design.
 *
 * Two surfaces, both of which appear in the artboards: `filled` is the grey
 * field used inside pages, `outlined` is the white bordered field in the app
 * header — measured at #ffffff against the header's #fafafa ground.
 */
export function Input({
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    containerClassName,
    surface = "filled",
    className,
    id,
    disabled,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
        <div className={cn("flex w-full flex-col", containerClassName)}>
            {label ? (
                <label
                    htmlFor={inputId}
                    className="mb-0.5 text-xs leading-3 font-medium text-content-secondary"
                >
                    {label}
                </label>
            ) : null}

            <div
                className={cn(
                    "flex items-center gap-2 rounded-md px-3 transition-colors",
                    surface === "outlined"
                        ? "border border-border-subtle bg-bg-primary"
                        : "border border-transparent bg-bg-secondary",
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
                <p id={`${inputId}-error`} className="mt-1.5 text-xs text-content-negative">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-content-tertiary">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
