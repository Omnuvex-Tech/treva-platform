/* eslint-disable @next/next/no-img-element -- fixed-size two-tone glyphs exported from the artboard */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The two card shells of the news editor (873:51432).
 *
 * Figma draws every stroke inside its frame, so each padding below is the
 * artboard's minus the 1px the CSS border (or rule) takes: a header the file
 * pads 14/15 is 14/14 here, and so on. Heights land on the artboard's.
 */

export interface EditorCardProps {
    /** A 14px two-tone glyph from /public/images/news/editor. */
    iconSrc: string;
    title: string;
    /** Sits at the right of the header row — the file puts a small outlined button there. */
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * The left column's `Container` (873:51458): 16px radius, a header of a 14px
 * glyph 8px from a 14/Bold heading, closed by an Overlay/20 rule.
 */
export function EditorCard({ iconSrc, title, action, children, className }: EditorCardProps) {
    return (
        <section
            className={cn(
                "flex w-full flex-col overflow-clip rounded-lg border border-border-subtle bg-bg-primary",
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-[var(--color-border-overlay)] px-5 pt-3.5 pb-3.5">
                <div className="flex items-center gap-2">
                    <img src={iconSrc} alt="" width={14} height={14} className="size-3.5 shrink-0" />
                    <h2 className="text-sm leading-5 font-bold text-content-primary">{title}</h2>
                </div>
                {action}
            </div>

            {children}
        </section>
    );
}

/**
 * The rail's `SideCard` (873:51613): 14px radius, a 14/Semibold heading on
 * Content/Tertiary Inverse with no glyph, then a 20 / 16 padded body.
 */
export function EditorSideCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex w-full flex-col rounded-[14px] border border-border-subtle bg-bg-primary">
            <h2 className="border-b border-[var(--color-border-overlay)] px-5 pt-3 pb-3 text-sm leading-5 font-semibold text-[var(--color-content-tertiary-inverse)]">
                {title}
            </h2>
            <div className="px-5 py-4">{children}</div>
        </section>
    );
}

/**
 * A field's label row: 12/Semibold on Content/Secondary, the required mark in
 * Content/Negative, 4px above the control.
 */
export function EditorField({
    label,
    htmlFor,
    required = false,
    children,
    className,
}: {
    label: string;
    htmlFor?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-1", className)}>
            <label htmlFor={htmlFor} className="text-xs leading-[18px] font-semibold text-content-secondary">
                {label}
                {required ? <span className="text-content-negative">*</span> : null}
            </label>
            {children}
        </div>
    );
}

/** The outlined 14/Medium brand button the headers and the header row use. */
export const outlineButtonClass =
    "flex items-center justify-center gap-2 rounded-lg border border-border-brand text-sm leading-5 font-medium whitespace-nowrap text-content-brand transition-colors hover:bg-bg-secondary disabled:opacity-60";

/** The 36px white select trigger on Border/Tertiary (`Select option states Light`). */
export const selectTriggerClass =
    "h-9 rounded-md border-border-tertiary bg-bg-primary pr-[11px] pl-[15px] text-content-primary";
