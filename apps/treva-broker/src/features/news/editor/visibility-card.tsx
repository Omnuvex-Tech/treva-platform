"use client";

import {
    Building01Icon,
    Key01Icon,
    Settings02Icon,
    UserGroup03Icon,
    UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/providers/i18n-provider";
import { VISIBILITY_AUDIENCES, type VisibilityAudience } from "../types";
import { EditorSection } from "./editor-section";

export interface VisibilityCardProps {
    visibility: Record<VisibilityAudience, boolean>;
    onChange: (visibility: Record<VisibilityAudience, boolean>) => void;
}

const AUDIENCE_ICON: Record<VisibilityAudience, IconSvgElement> = {
    brokers: UserMultiple02Icon,
    topBrokers: Key01Icon,
    admins: Settings02Icon,
    agencies: Building01Icon,
    clients: UserGroup03Icon,
};

/**
 * Artboard 873:51626 — five audience rows, each an icon plus a title and a
 * description with a toggle on the right.
 */
export function VisibilityCard({ visibility, onChange }: VisibilityCardProps) {
    const { t } = useI18n();

    return (
        <EditorSection icon={UserGroup03Icon} title={t.news.editor.visibility}>
            <ul className="flex flex-col gap-3">
                {VISIBILITY_AUDIENCES.map((audience) => (
                    <li key={audience} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-s bg-bg-secondary text-content-tertiary">
                            <HugeiconsIcon
                                icon={AUDIENCE_ICON[audience]}
                                size={13}
                                strokeWidth={1.6}
                            />
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-content-primary">
                                {t.news.editor.audience[audience]}
                            </p>
                            <p className="text-xs text-content-tertiary">
                                {t.news.editor.audienceHint[audience]}
                            </p>
                        </div>

                        <Switch
                            checked={visibility[audience]}
                            aria-label={t.news.editor.audience[audience]}
                            onChange={(event) =>
                                onChange({ ...visibility, [audience]: event.target.checked })
                            }
                        />
                    </li>
                ))}
            </ul>
        </EditorSection>
    );
}
