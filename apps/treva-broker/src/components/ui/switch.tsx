"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

/**
 * The `Toggle` component from the design (I873:52115).
 *
 * 32x20 with a 16px knob inset 2 — so the travel is 12, not 16. The off state
 * is Background/Teritary, a step lighter than the Border/Tertiary an earlier
 * pass used.
 *
 * The labelled form is the "Block Agent" row on the agent form (I873:48747):
 * 4px from the control, 16/Regular on Content/Secondary — a size up from the
 * 14px the rest of the app's body copy uses.
 */
export function Switch({ label, className, id, ...props }: SwitchProps) {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    return (
        <div className="inline-flex items-center gap-1">
            <span className="relative inline-flex">
                <input
                    id={switchId}
                    type="checkbox"
                    role="switch"
                    className={cn(
                        // 32x20 with a 16px knob (873:52115) — w-9 was 36.
                        "peer h-5 w-8 cursor-pointer appearance-none rounded-pill bg-bg-tertiary transition-colors",
                        "checked:bg-bg-brand",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...props}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-pill bg-bg-primary shadow-l2 transition-transform peer-checked:translate-x-3"
                />
            </span>

            {label ? (
                <label
                    htmlFor={switchId}
                    className="cursor-pointer text-base leading-5 text-content-secondary"
                >
                    {label}
                </label>
            ) : null}
        </div>
    );
}
