"use client";

import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
    label?: string;
    error?: string;
    options: readonly SelectOption[];
    placeholder?: string;
    containerClassName?: string;
}

/**
 * Native `<select>` styled to match the design's dropdown.
 *
 * Deliberately not a custom listbox: every dropdown in the Figma file is a plain
 * single-choice picker, and the native control brings mobile pickers, type-ahead
 * and screen-reader support that a div-based one would have to re-earn. Reach
 * for a headless listbox only when a screen actually needs multi-select or
 * rich option rows.
 */
export function Select({
    label,
    error,
    options,
    placeholder,
    containerClassName,
    className,
    id,
    disabled,
    ...props
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
        <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
            {label ? (
                <label htmlFor={selectId} className="text-xs font-medium text-content-secondary">
                    {label}
                </label>
            ) : null}

            <div className="relative">
                <select
                    id={selectId}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        "h-11 w-full appearance-none rounded-md bg-bg-secondary px-3 pr-9 text-sm text-content-primary",
                        "border border-transparent outline-none transition-colors",
                        "focus:border-border-brand focus:bg-bg-primary",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        error && "border-content-negative",
                        className,
                    )}
                    {...props}
                >
                    {placeholder ? (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    ) : null}

                    {options.map((option) => (
                        <option key={option.value} value={option.value} disabled={option.disabled}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-content-tertiary"
                />
            </div>

            {error ? <p className="text-xs text-content-negative">{error}</p> : null}
        </div>
    );
}
