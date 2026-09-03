import type { ReactNode } from "react";

export interface SectionHeaderProps {
    title: string;
    description: string;
    /** Rendered hard right — Live Availability puts its switch there. */
    action?: ReactNode;
}

/**
 * The heading every section of the project editor opens with (873:51128).
 *
 * A 14/Semibold title over a 14/Regular line of Content/Tertiary, inset 8 to
 * line up with the cards below it, and 12 of air before the section's body.
 */
export function SectionHeader({ title, description, action }: SectionHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 px-2">
            <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-content-primary">{title}</h2>
                <p className="truncate text-sm text-content-tertiary">{description}</p>
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
