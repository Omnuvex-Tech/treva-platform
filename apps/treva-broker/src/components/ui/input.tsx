"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** React 19 passes `ref` through `...props`; this only declares the type. */
    ref?: Ref<HTMLInputElement>;
    label?: string;
    hint?: string;
    error?: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    containerClassName?: string;
    /**
     * `filled` is the grey field used inside pages; `outlined` is the white,
     * bordered field the app header and the list search use; `form` is the
     * white field with a Border/Tertiary edge that the lead form uses; `light`
     * is the same white field on the XXL radius that modals draw.
     */
    surface?: "filled" | "outlined" | "form" | "light";
    /** `md` is the 44px field; `sm` is the 36px one the lead form draws. */
    size?: "sm" | "md";
    /**
     * Glyph size in the leading/trailing slots. 16 everywhere by default, which
     * is what the list and header searches draw; the company field on sign-up
     * (873:60467) is the one that draws 20.
     */
    iconSize?: 16 | 20;
}

/**
 * The `Input / TextInput Light` component from the design.
 *
 * Three surfaces, all of which appear in the artboards: `filled` is the grey
 * field used inside pages, `outlined` is the white bordered field in the app
 * header and the list search (873:49761), and `form` is the white field with a
 * #ccc edge that every field on the lead form uses (873:49388).
 *
 * The label is 12/Semibold sitting 4px above the field, and a required field
 * marks itself with a red asterisk — both straight off the shared component in
 * the file, so they are here rather than at each call site.
 */
export function Input({
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    containerClassName,
    surface = "filled",
    size = "md",
    iconSize = 16,
    className,
    id,
    disabled,
    required,
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
                    className={cn(
                        "mb-1 text-xs font-semibold",
                        // The read-only fields on Profile (I873:48774) grey the
                        // label as well as the field — a disabled row reads as
                        // one block, not as a live label over a dead box.
                        disabled ? "text-content-disabled" : "text-content-secondary",
                    )}
                >
                    {label}
                    {required ? <span className="text-content-negative">*</span> : null}
                </label>
            ) : null}

            <div
                className={cn(
                    "flex items-center gap-2 rounded-md transition-colors",
                    // Height lives on the bordered box, not on the input: Figma
                    // counts the 1px edge inside the 36/44, so an h-9 input in a
                    // bordered wrapper would come out 38.
                    size === "sm" ? "h-9 px-2" : "h-11 px-3",
                    surface === "outlined"
                        // 3XL, not XXL: both outlined fields in the file — the
                        // app header's and the list search (873:49761) — are 16.
                        ? "rounded-lg border border-border-subtle bg-bg-primary"
                        : surface === "form"
                          ? "border border-border-tertiary bg-bg-primary"
                          : surface === "light"
                            // Same white-on-subtle edge as `outlined`, but on
                            // the base XXL radius — the fields modals draw
                            // ("Add Files", 873:49832) sit at 12, not 16.
                            ? "border border-border-subtle bg-bg-primary"
                            : "border border-transparent bg-bg-secondary",
                    "focus-within:border-border-brand focus-within:bg-bg-primary",
                    error && "border-content-negative",
                    // Background/Disabled is Background/Secondary — the field
                    // keeps its edge and loses its white (I873:48774). An
                    // opacity fade cannot produce that: it washes the border out
                    // too, and the artboard keeps it at full strength.
                    disabled && "border-border-subtle bg-bg-secondary focus-within:bg-bg-secondary",
                )}
            >
                {leadingIcon ? (
                    <span
                        className={cn(
                            "flex shrink-0 items-center text-content-tertiary",
                            iconSize === 20 ? "[&_svg]:size-5" : "[&_svg]:size-4",
                        )}
                    >
                        {leadingIcon}
                    </span>
                ) : null}

                <input
                    id={inputId}
                    disabled={disabled}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        "h-full w-full min-w-0 bg-transparent text-sm text-content-primary outline-none",
                        "placeholder:text-content-tertiary",
                        "disabled:cursor-not-allowed disabled:text-content-disabled disabled:placeholder:text-content-disabled",
                        className,
                    )}
                    {...props}
                />

                {trailingIcon ? (
                    <span
                        className={cn(
                            "flex shrink-0 items-center text-content-tertiary",
                            iconSize === 20 ? "[&_svg]:size-5" : "[&_svg]:size-4",
                        )}
                    >
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
