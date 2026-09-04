"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

/**
 * The `Radio` component from the design (I873:48735) — the role picker on the
 * agent form.
 *
 * The ring is Stroke/md (2px) on Border/Brand in BOTH states: the artboard draws
 * every option with the same dark ring and marks the selected one by filling its
 * centre, so the border is not what carries the selection. Label and control sit
 * 4px apart, not 8.
 */
export function Radio({ label, className, id, ...props }: RadioProps) {
    const generatedId = useId();
    const radioId = id ?? generatedId;

    return (
        <div className="inline-flex items-center gap-1">
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <input
                    id={radioId}
                    type="radio"
                    className={cn(
                        "peer size-4 cursor-pointer appearance-none rounded-pill border-2 border-border-brand bg-bg-primary transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...props}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute size-2 rounded-pill bg-bg-brand opacity-0 peer-checked:opacity-100"
                />
            </span>

            <label
                htmlFor={radioId}
                className="cursor-pointer text-sm whitespace-nowrap text-content-secondary"
            >
                {label}
            </label>
        </div>
    );
}

export interface RadioGroupProps<T extends string> {
    name: string;
    legend?: string;
    value: T;
    onChange: (value: T) => void;
    options: readonly { value: T; label: string }[];
    className?: string;
}

export function RadioGroup<T extends string>({
    name,
    legend,
    value,
    onChange,
    options,
    className,
}: RadioGroupProps<T>) {
    return (
        <fieldset className={className}>
            {/* 873:48727 — an 18px label row, then the options 16 below it. */}
            {legend ? (
                <legend className="mb-4 text-xs leading-[18px] font-semibold text-content-secondary">
                    {legend}
                </legend>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        name={name}
                        value={option.value}
                        label={option.label}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                    />
                ))}
            </div>
        </fieldset>
    );
}
