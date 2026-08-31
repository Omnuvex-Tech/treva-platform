"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

/** The `Radio` component from the design — used by the role picker in the user form. */
export function Radio({ label, className, id, ...props }: RadioProps) {
    const generatedId = useId();
    const radioId = id ?? generatedId;

    return (
        <div className="inline-flex items-center gap-2">
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <input
                    id={radioId}
                    type="radio"
                    className={cn(
                        "peer size-4 cursor-pointer appearance-none rounded-pill border border-border-tertiary bg-bg-primary transition-colors",
                        "checked:border-border-brand",
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

            <label htmlFor={radioId} className="cursor-pointer text-sm whitespace-nowrap text-content-primary">
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
            {legend ? (
                <legend className="mb-1.5 text-xs font-medium text-content-secondary">{legend}</legend>
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
