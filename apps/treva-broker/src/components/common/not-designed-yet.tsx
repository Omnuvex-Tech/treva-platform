import { PenLine } from "lucide-react";

const FIGMA_FILE = "https://www.figma.com/design/SJRCdsOsEa1DCArrbghoPr/TREVA-Real-Estate-Admin-Crm";

export interface NotDesignedYetProps {
    /** The artboard that exists but has no content drawn in it. */
    nodeId: string;
    /** What the screen is for, in one line. */
    purpose: string;
}

/**
 * For a route that has to exist — something links to it — but whose artboard is
 * still an empty frame in Figma.
 *
 * Distinct from `ComingSoon`, which means "designed, not built yet". This one
 * means "there is nothing to build from", and building it anyway would be
 * inventing a screen the designer has not drawn.
 */
export function NotDesignedYet({ nodeId, purpose }: NotDesignedYetProps) {
    return (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-subtle p-8">
            <span className="flex size-11 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary">
                <PenLine className="size-5" />
            </span>

            <p className="text-base font-semibold text-content-primary">Not designed yet</p>
            <p className="text-sm text-content-tertiary">
                {purpose} The artboard for this step exists in Figma but is still an empty frame, so
                there is nothing to build from — rather than invent a screen, the route is left as
                this placeholder.
            </p>

            <a
                href={`${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-pill bg-bg-secondary px-3 py-1 text-xs font-medium text-content-link hover:bg-bg-tertiary"
            >
                Open the artboard
            </a>
        </div>
    );
}
