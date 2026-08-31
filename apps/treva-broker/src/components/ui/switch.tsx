"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

/** The `Toggle` component from the design — used in Users and Language screens. */
export function Switch({ label, className, id, ...props }: SwitchProps) {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    return (
        <div className="inline-flex items-center gap-2">
            <span className="relative inline-flex">
                <input
                    id={switchId}
                    type="checkbox"
                    role="switch"
                    className={cn(
                        "peer h-5 w-9 cursor-pointer appearance-none rounded-pill bg-border-tertiary transition-colors",
                        "checked:bg-bg-brand",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...props}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-pill bg-bg-primary shadow-l2 transition-transform peer-checked:translate-x-4"
                />
            </span>

            {label ? (
                <label htmlFor={switchId} className="cursor-pointer text-sm text-content-primary">
                    {label}
                </label>
            ) : null}
        </div>
    );
}
