"use client";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { useI18n } from "@/providers/i18n-provider";
import { VISIBILITY_OPTIONS, type VisibilityOption } from "../types";
import { EditorSideCard } from "./editor-card";

type Row = "pinned" | VisibilityOption;

const ROWS: readonly Row[] = ["pinned", ...VISIBILITY_OPTIONS];

const ICON: Record<Row, string> = {
    pinned: "opt-pinned",
    featured: "opt-featured",
    showOnDashboard: "opt-dashboard",
    pushNotification: "opt-push",
    emailNotification: "opt-email",
};

export interface VisibilityCardProps {
    pinned: boolean;
    visibility: Record<VisibilityOption, boolean>;
    onChange: (patch: { pinned?: boolean; visibility?: Record<VisibilityOption, boolean> }) => void;
}

/**
 * Visibility (873:51626): five rows 8px apart — a 28px Background/Secondary
 * tile on the 10px radius with a 13px glyph, a 12/Semibold title over a
 * description clipped to 13.75px, and the 32x20 `Toggle` 12px to the right.
 */
export function VisibilityCard({ pinned, visibility, onChange }: VisibilityCardProps) {
    const { t } = useI18n();
    const copy = t.news.editor;

    return (
        <EditorSideCard title={copy.visibility}>
            {/* -mr-px: the artboard's list is 236 wide in a 235px body (873:51631), which
                is what puts the toggles 204px in. */}
            <ul className="-mr-px flex flex-col gap-2">
                {ROWS.map((row) => {
                    const checked = row === "pinned" ? pinned : visibility[row];
                    const toggle = () =>
                        row === "pinned"
                            ? onChange({ pinned: !pinned })
                            : onChange({ visibility: { ...visibility, [row]: !visibility[row] } });

                    return (
                        <li key={row} className="flex items-center gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-bg-secondary text-content-brand">
                                    <AssetIcon src={`/images/news/editor/${ICON[row]}.svg`} size={13} />
                                </span>

                                <div className="flex min-w-0 flex-col">
                                    <p className="truncate text-xs leading-[18px] font-semibold text-content-primary">
                                        {copy.options[row]}
                                    </p>
                                    <p className="h-[13.75px] overflow-hidden text-xs leading-[18px] whitespace-nowrap text-[var(--color-content-tertiary-inverse)]">
                                        {copy.optionHints[row]}
                                    </p>
                                </div>
                            </div>

                            {/* `Toggle` (873:51643): 32x20, a 16px white knob inset 2,
                                Background/Teritary off and Content/Brand on. */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={checked}
                                aria-label={copy.options[row]}
                                onClick={toggle}
                                className={cn(
                                    "flex h-5 w-8 shrink-0 items-center overflow-clip rounded-[120px] p-0.5 transition-colors",
                                    checked ? "justify-end bg-content-brand" : "justify-start bg-bg-tertiary",
                                )}
                            >
                                <span aria-hidden className="size-4 rounded-[100px] bg-bg-primary" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </EditorSideCard>
    );
}
