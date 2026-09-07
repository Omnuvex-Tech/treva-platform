"use client";

import { Check } from "lucide-react";
import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

/**
 * Native checkbox kept in the DOM (visually hidden via `peer` + `appearance-none`)
 * rather than replaced by a div: forms, labels, and keyboard/AT behaviour all
 * keep working for free.
 */
export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
        <div className="inline-flex items-center gap-2">
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <input
                    id={checkboxId}
                    type="checkbox"
                    className={cn(
                        // 16px, 2px Border/Brand edge, 4px radius (I873:49400).
                        "peer size-4 cursor-pointer appearance-none rounded-xxs border-2 border-border-brand bg-bg-primary transition-colors",
                        "checked:border-border-brand checked:bg-bg-brand",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...props}
                />
                <Check
                    aria-hidden
                    className="pointer-events-none absolute size-3 text-content-inverse opacity-0 peer-checked:opacity-100"
                    strokeWidth={3}
                />
            </span>

            {label ? (
                <label htmlFor={checkboxId} className="cursor-pointer text-sm text-content-primary">
                    {label}
                </label>
            ) : null}
        </div>
    );
}
