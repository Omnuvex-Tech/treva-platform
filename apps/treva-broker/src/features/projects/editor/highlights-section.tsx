"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { isApiError } from "@/lib/api/errors";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { projectsService } from "../api/projects.service";
import { HIGHLIGHT_KINDS, type HighlightKind, type ProjectHighlight } from "../types";
import { AddRowButton, RowControls } from "./row-controls";
import { SectionHeader } from "./section-header";

const ICONS = "/images/projects";

/**
 * One glyph per kind (873:51136…873:51217), exported from the artboard.
 *
 * The six cards carry five distinct icons — calendar, card, waves, a pill and a
 * tram — and the switched-off sixth repeats the card, so mortgage shares
 * payment's glyph rather than inventing a bank.
 */
const KIND_ICON: Record<HighlightKind, string> = {
    handover: `${ICONS}/highlight-handover.svg`,
    payment: `${ICONS}/highlight-payment.svg`,
    view: `${ICONS}/highlight-view.svg`,
    amenities: `${ICONS}/highlight-amenities.svg`,
    transit: `${ICONS}/highlight-transit.svg`,
    mortgage: `${ICONS}/highlight-payment.svg`,
};

/** What POST /projects/icons stores: the gallery's types plus SVG, up to 1 MB. */
const ICON_ACCEPT = "image/svg+xml,image/png,image/jpeg,image/webp";
const MAX_ICON_BYTES = 1024 * 1024;

/**
 * The 36px icon well (873:51135) as a control: click it to upload the row's own
 * icon, which then replaces the kind's glyph. An uploaded icon keeps its own
 * colours rather than being masked to brand, and a small chip on its corner
 * puts the glyph back.
 */
function IconWell({
    highlight,
    onChange,
    disabled,
}: {
    highlight: ProjectHighlight;
    onChange: (iconUrl: string | null) => void;
    disabled?: boolean;
}) {
    const { t, locale } = useI18n();
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const iconUrl = highlight.iconUrl ?? null;
    const label = iconUrl ? t.projects.editor.replaceIcon : t.projects.editor.highlightIcon;

    async function upload(file: File) {
        if (file.size > MAX_ICON_BYTES) {
            toast.error(
                interpolate(t.common.upload.tooLarge, {
                    name: file.name,
                    limit: formatBytes(MAX_ICON_BYTES, locale),
                }),
            );
            return;
        }

        setUploading(true);
        try {
            onChange(await projectsService.uploadIcon(file));
        } catch (error) {
            toast.error(
                isApiError(error) && error.status !== 0
                    ? error.message
                    : interpolate(t.common.upload.uploadFailed, { name: file.name }),
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <span className="group/icon relative shrink-0">
            {/* 36 square, Background/Secondary behind a 1px white edge; the
                kind's 14px glyph in brand, or the uploaded icon at 20. */}
            <button
                type="button"
                disabled={disabled || uploading}
                aria-busy={uploading}
                aria-label={label}
                title={label}
                onClick={() => {
                    if (inputRef.current) inputRef.current.value = "";
                    inputRef.current?.click();
                }}
                className={cn(
                    "flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-bg-primary bg-bg-secondary text-content-brand transition-shadow hover:ring-2 hover:ring-border-brand focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:outline-none disabled:cursor-not-allowed disabled:hover:ring-0",
                    uploading && "animate-pulse",
                )}
            >
                {iconUrl ? (
                    // An SVG or a data URL (mock uploads) — neither goes through
                    // next's Image optimiser.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconUrl} alt="" className="size-5 object-contain" />
                ) : (
                    <AssetIcon src={KIND_ICON[highlight.kind]} size={14} />
                )}
            </button>

            {iconUrl && !disabled ? (
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    aria-label={t.projects.editor.removeIcon}
                    title={t.projects.editor.removeIcon}
                    className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border border-border-subtle bg-bg-primary text-content-secondary opacity-0 transition-opacity group-hover/icon:opacity-100 hover:text-content-primary focus-visible:opacity-100"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={10} strokeWidth={2} />
                </button>
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept={ICON_ACCEPT}
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                }}
            />
        </span>
    );
}

export interface HighlightsSectionProps {
    highlights: readonly ProjectHighlight[];
    onChange: (highlights: ProjectHighlight[]) => void;
    disabled?: boolean;
}

/**
 * Key Highlights (873:51127).
 *
 * A two-column grid of 550x86.67 cards 12 apart. Each card is a 14px radius
 * with its 17px inset measured from the outer edge (16 + the 1px stroke), and
 * holds a 36px icon well, a 52.5-tall text column and the switch/delete pair.
 * Turning a row off greys the whole card rather than hiding it, which is what
 * the sixth card in the artboard is showing.
 *
 * Both text lines are editable in place: the artboard draws them as "Text
 * Input" frames, not as static labels, so they are inputs that carry no chrome.
 * Their offsets are the frames' own — the label at 3, the value at 32.
 */
export function HighlightsSection({ highlights, onChange, disabled }: HighlightsSectionProps) {
    const { t } = useI18n();
    // An icon upload resolves after the render that started it; patching from
    // that render's list would drop whatever was typed in the meantime.
    const latest = useRef(highlights);
    latest.current = highlights;

    function patch(id: string, changes: Partial<ProjectHighlight>) {
        onChange(latest.current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
    }

    function add() {
        // Cycle through the six kinds so a new row still gets its own glyph.
        const kind = HIGHLIGHT_KINDS[highlights.length % HIGHLIGHT_KINDS.length]!;
        onChange([
            ...highlights,
            {
                id: `hl_${Date.now().toString(36)}`,
                kind,
                iconUrl: null,
                label: "",
                value: "",
                enabled: true,
            },
        ]);
    }

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                variant="highlights"
                title={t.projects.editor.highlights}
                description={t.projects.editor.highlightsHint}
            />

            <div className="grid gap-3 px-2 lg:grid-cols-2">
                {highlights.map((highlight) => (
                    <div
                        key={highlight.id}
                        className={cn(
                            "flex min-h-[86.67px] items-start gap-3 rounded-[14px] border border-border-subtle bg-bg-primary p-4",
                            // 873:51214 draws the switched-off row at half
                            // strength rather than removing it.
                            !highlight.enabled && "opacity-50",
                        )}
                    >
                        <IconWell
                            highlight={highlight}
                            disabled={disabled}
                            onChange={(iconUrl) => patch(highlight.id, { iconUrl })}
                        />

                        <div className="flex h-[52.5px] min-w-0 flex-1 flex-col">
                            <input
                                value={highlight.label}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(highlight.id, { label: event.target.value })
                                }
                                placeholder={t.projects.editor.highlightLabel}
                                aria-label={t.projects.editor.highlightLabel}
                                className="mt-[3px] block h-5 w-full bg-transparent p-0 text-sm leading-5 font-semibold text-content-primary outline-none placeholder:font-normal placeholder:text-content-disabled"
                            />
                            <input
                                value={highlight.value}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(highlight.id, { value: event.target.value })
                                }
                                placeholder={t.projects.editor.highlightValue}
                                aria-label={t.projects.editor.highlightValue}
                                className="mt-[9px] block h-[18px] w-full bg-transparent p-0 text-xs leading-[18px] text-content-secondary outline-none placeholder:text-content-disabled"
                            />
                        </div>

                        <RowControls
                            enabled={highlight.enabled}
                            disabled={disabled}
                            toggleLabel={t.projects.editor.highlightEnabled}
                            onToggle={(enabled) => patch(highlight.id, { enabled })}
                            onDelete={() =>
                                onChange(highlights.filter((entry) => entry.id !== highlight.id))
                            }
                        />
                    </div>
                ))}
            </div>

            <AddRowButton label={t.projects.editor.addHighlight} disabled={disabled} onClick={add} />
        </section>
    );
}
