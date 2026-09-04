"use client";

import {
    Add01Icon,
    BankIcon,
    Calendar01Icon,
    CreditCardIcon,
    Delete02Icon,
    MetroIcon,
    SwimmingIcon,
    WavesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { HIGHLIGHT_KINDS, type HighlightKind, type ProjectHighlight } from "../types";
import { SectionHeader } from "./section-header";

/**
 * One glyph per kind (873:51136).
 *
 * The artboard exports a different icon in every card and names none of them,
 * so these are matched to what each row is about — the layer names spell that
 * out even though the rendered text is placeholder copy.
 */
const KIND_ICON: Record<HighlightKind, IconSvgElement> = {
    handover: Calendar01Icon,
    payment: CreditCardIcon,
    view: WavesIcon,
    amenities: SwimmingIcon,
    transit: MetroIcon,
    mortgage: BankIcon,
};

export interface HighlightsSectionProps {
    highlights: readonly ProjectHighlight[];
    onChange: (highlights: ProjectHighlight[]) => void;
    disabled?: boolean;
}

/**
 * Key Highlights (873:51127).
 *
 * A two-column grid of 550x86 cards 12 apart, each holding a 36px icon well, a
 * 14/Semibold label over a 12/Regular value, and a switch beside a 28px delete
 * chip. Turning a row off greys the whole card rather than hiding it, which is
 * what the sixth card in the artboard is showing.
 *
 * Both text lines are editable in place: the artboard draws them as "Text
 * Input" frames, not as static labels, so they are inputs that carry no chrome
 * until focused.
 */
export function HighlightsSection({ highlights, onChange, disabled }: HighlightsSectionProps) {
    const { t } = useI18n();

    function patch(id: string, changes: Partial<ProjectHighlight>) {
        onChange(highlights.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
    }

    function add() {
        // Cycle through the six kinds so a new row still gets its own glyph.
        const kind = HIGHLIGHT_KINDS[highlights.length % HIGHLIGHT_KINDS.length]!;
        onChange([
            ...highlights,
            {
                id: `hl_${Date.now().toString(36)}`,
                kind,
                label: "",
                value: "",
                enabled: true,
            },
        ]);
    }

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                title={t.projects.editor.highlights}
                description={t.projects.editor.highlightsHint}
            />

            <div className="grid gap-3 px-2 lg:grid-cols-2">
                {highlights.map((highlight) => (
                    <div
                        key={highlight.id}
                        className={cn(
                            // 86.67 tall in the file: a 52.5 text column inside 17px padding.
                            "flex min-h-[86px] items-start gap-3 rounded-md border border-border-subtle bg-bg-primary p-[17px]",
                            // 873:51178 draws the switched-off row at half
                            // strength rather than removing it.
                            !highlight.enabled && "opacity-50",
                        )}
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border-inverse bg-bg-secondary text-content-tertiary">
                            <HugeiconsIcon
                                icon={KIND_ICON[highlight.kind]}
                                size={14}
                                strokeWidth={1.6}
                            />
                        </span>

                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                            <input
                                value={highlight.label}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(highlight.id, { label: event.target.value })
                                }
                                placeholder={t.projects.editor.highlightLabel}
                                aria-label={t.projects.editor.highlightLabel}
                                className="w-full bg-transparent text-sm font-semibold text-content-primary outline-none placeholder:font-normal placeholder:text-content-disabled"
                            />
                            <input
                                value={highlight.value}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(highlight.id, { value: event.target.value })
                                }
                                placeholder={t.projects.editor.highlightValue}
                                aria-label={t.projects.editor.highlightValue}
                                className="w-full bg-transparent text-xs text-content-secondary outline-none placeholder:text-content-disabled"
                            />
                        </div>

                        <div className="flex shrink-0 items-center gap-2 pt-0.5">
                            <Switch
                                checked={highlight.enabled}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(highlight.id, { enabled: event.target.checked })
                                }
                                aria-label={t.projects.editor.highlightEnabled}
                            />

                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    onChange(highlights.filter((entry) => entry.id !== highlight.id))
                                }
                                aria-label={t.common.delete}
                                title={t.common.delete}
                                className="flex h-7 items-center rounded-sm bg-bg-secondary px-2 text-content-tertiary transition-colors hover:bg-bg-tertiary disabled:opacity-50"
                            >
                                <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 873:51229 — full width, 44 tall, outlined. */}
            <div className="px-2">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={disabled}
                    className="w-full rounded-lg"
                    leadingIcon={<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />}
                    onClick={add}
                >
                    {t.projects.editor.addHighlight}
                </Button>
            </div>
        </section>
    );
}
