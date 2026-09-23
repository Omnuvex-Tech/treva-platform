"use client";

import { AssetIcon } from "@/components/ui/asset-icon";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import type { OfferTag, ProjectOffer } from "../types";
import { AddRowButton, RowControls } from "./row-controls";
import { SectionHeader } from "./section-header";

const TAGS: readonly OfferTag[] = ["new", "limited", "exclusive"];

/**
 * The badge inside the select (873:51244 / 873:51265): 20 tall, 4px of side
 * padding, 12/Medium on the plain status inks — Content/Positive, not the
 * Positive Bold the shared Badge tone carries. Both drawn badges are fixed
 * widths (40 and 70) with the label centred, not hugging it.
 */
const TAG_STYLE: Record<OfferTag, string> = {
    new: "w-10 bg-bg-positive-subtle text-content-positive",
    limited: "w-[70px] bg-bg-notice-subtle text-content-notice",
    exclusive: "w-[70px] bg-bg-info-subtle text-content-link",
};

export interface OffersSectionProps {
    offers: readonly ProjectOffer[];
    onChange: (offers: ProjectOffer[]) => void;
    disabled?: boolean;
}

/**
 * Special Offers (873:51230).
 *
 * The card row sits 20 below the 12px section gap (873:51236's own top
 * padding). The artboard's cards are not equal thirds: the first two are fixed
 * at 343 and the last takes the remaining 402, which the grid template repeats
 * for every row of three.
 *
 * Each card is the 14px shell the highlights use, with 16 between a content
 * column and the switch/delete pair. The column stacks a 194x36 select whose
 * value renders as the badge, a 91.5-tall block holding the title (top 2) and
 * description (top 34), and an "Expires:" row with a 126x28 date field.
 */
export function OffersSection({ offers, onChange, disabled }: OffersSectionProps) {
    const { t } = useI18n();

    function patch(id: string, changes: Partial<ProjectOffer>) {
        onChange(offers.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
    }

    function add() {
        onChange([
            ...offers,
            {
                id: `of_${Date.now().toString(36)}`,
                tag: "new",
                title: "",
                description: "",
                expiresAt: "",
                enabled: true,
            },
        ]);
    }

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                title={t.projects.editor.offers}
                description={t.projects.editor.offersHint}
            />

            <div className="grid items-start gap-3 px-2 pt-5 lg:grid-cols-[343px_343px_minmax(0,1fr)]">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className={cn(
                            "flex items-start gap-4 rounded-[14px] border border-border-subtle bg-bg-primary p-4",
                            !offer.enabled && "opacity-50",
                        )}
                    >
                        <div className="flex min-w-0 flex-1 flex-col">
                            {/* The select's value IS the badge — the artboard
                                puts a Badge instance inside the field. */}
                            <Select
                                value={offer.tag}
                                disabled={disabled}
                                onChange={(value) => patch(offer.id, { tag: value as OfferTag })}
                                options={TAGS.map((tag) => ({
                                    value: tag,
                                    label: t.projects.editor.offerTags[tag],
                                }))}
                                aria-label={t.projects.editor.offerTag}
                                className="h-9 border-border-tertiary bg-bg-primary px-3"
                                containerClassName="w-[194px]"
                                icon={
                                    <AssetIcon
                                        src="/images/news/editor/select-chevron.svg"
                                        size={20}
                                        className="text-content-tertiary"
                                    />
                                }
                                renderValue={(value) => (
                                    <span
                                        className={cn(
                                            "inline-flex h-5 items-center justify-center rounded-pill px-1 text-xs font-medium",
                                            TAG_STYLE[value as OfferTag],
                                        )}
                                    >
                                        {t.projects.editor.offerTags[value as OfferTag]}
                                    </span>
                                )}
                            />

                            <div className="relative h-[91.5px]">
                                <input
                                    value={offer.title}
                                    disabled={disabled}
                                    onChange={(event) =>
                                        patch(offer.id, { title: event.target.value })
                                    }
                                    placeholder={t.projects.editor.offerTitle}
                                    aria-label={t.projects.editor.offerTitle}
                                    className="absolute top-0.5 left-0 block h-[22px] w-full bg-transparent p-0 text-sm leading-[21px] font-semibold text-content-primary outline-none placeholder:font-normal placeholder:text-content-disabled"
                                />

                                <textarea
                                    value={offer.description}
                                    disabled={disabled}
                                    rows={2}
                                    onChange={(event) =>
                                        patch(offer.id, { description: event.target.value })
                                    }
                                    placeholder={t.projects.editor.offerDescription}
                                    aria-label={t.projects.editor.offerDescription}
                                    className="absolute top-[34px] left-0 block h-[37px] w-full resize-none bg-transparent p-0 text-xs leading-[18px] text-content-secondary outline-none placeholder:text-content-disabled"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="shrink-0 text-xs text-content-tertiary">
                                    {t.projects.editor.expires}
                                </span>
                                {/* 873:51253 — an empty 126x28 box, white inside a
                                    Background/Secondary edge on an 8px radius:
                                    no placeholder and no glyph until a date is
                                    picked. The empty fragment is what switches
                                    the trigger's own calendar icon off. */}
                                <DatePicker
                                    value={offer.expiresAt}
                                    disabled={disabled}
                                    onChange={(value) => patch(offer.id, { expiresAt: value })}
                                    placeholder=""
                                    leadingIcon={<></>}
                                    containerClassName="w-[126px] gap-0"
                                    triggerClassName="h-7 gap-1 rounded-sm border-bg-secondary bg-bg-primary px-2 text-xs"
                                />
                            </div>
                        </div>

                        <RowControls
                            enabled={offer.enabled}
                            disabled={disabled}
                            toggleLabel={t.projects.editor.offerEnabled}
                            onToggle={(enabled) => patch(offer.id, { enabled })}
                            onDelete={() => onChange(offers.filter((e) => e.id !== offer.id))}
                        />
                    </div>
                ))}
            </div>

            {/* 873:51305 repeats the Highlights label verbatim; this one says
                what it actually adds. */}
            <AddRowButton label={t.projects.editor.addOffer} disabled={disabled} onClick={add} />
        </section>
    );
}
