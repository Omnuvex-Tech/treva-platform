"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";

export interface EditorSectionProps {
    icon: IconSvgElement;
    title: string;
    /** Rendered at the right of the header row — the artboard puts a button there. */
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
}

/**
 * The card shell every block of the news editor shares: a header row with a
 * 14px icon and a heading, then the body.
 *
 * Extracted because the artboard repeats it four times on the left column and
 * twice in the right rail, with only the icon, the title and the body changing.
 */
export function EditorSection({
    icon,
    title,
    action,
    children,
    className,
    bodyClassName,
}: EditorSectionProps) {
    return (
        <Card className={cn("flex flex-col", className)}>
            <div className="flex h-12 items-center justify-between gap-3 px-4">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={icon}
                        size={14}
                        strokeWidth={1.6}
                        className="text-content-tertiary"
                    />
                    <h2 className="text-sm font-semibold text-content-primary">{title}</h2>
                </div>

                {action}
            </div>

            <div className={cn("px-4 pb-4", bodyClassName)}>{children}</div>
        </Card>
    );
}
