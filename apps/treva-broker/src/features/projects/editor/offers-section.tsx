"use client";

import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import type { OfferTag, ProjectOffer } from "../types";
import { SectionHeader } from "./section-header";

const TAGS: readonly OfferTag[] = ["new", "limited", "exclusive"];

/** "New" is drawn green and "Limited" amber (873:51244 / 873:51265). */
const TAG_TONE: Record<OfferTag, "positive" | "notice" | "info"> = {
    new: "positive",
    limited: "notice",
    exclusive: "info",
};

export interface OffersSectionProps {
    offers: readonly ProjectOffer[];
    onChange: (offers: ProjectOffer[]) => void;
    disabled?: boolean;
}

/**
 * Special Offers (873:51230).
 *
 * Three cards on the same 14px shell the highlights use, each holding a 194x36
 * select whose chosen value renders as the badge itself, an editable title and
 * description, and an "Expires:" row with a 126x28 date picker. The switch and
 * the delete chip sit top right, and switching a card off greys it out.
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

            <div className="grid gap-3 px-2 lg:grid-cols-3">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className={cn(
                            "flex gap-3 rounded-md border border-border-subtle bg-bg-primary p-[17px]",
                            !offer.enabled && "opacity-50",
                        )}
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
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
                                className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-3"
                                containerClassName="w-[194px]"
                                renderValue={(value) => (
                                    <Badge
                                        tone={TAG_TONE[value as OfferTag]}
                                        className="px-2 py-1 text-xs font-medium tracking-normal normal-case"
                                    >
                                        {t.projects.editor.offerTags[value as OfferTag]}
                                    </Badge>
                                )}
                            />

                            <input
                                value={offer.title}
                                disabled={disabled}
                                onChange={(event) => patch(offer.id, { title: event.target.value })}
                                placeholder={t.projects.editor.offerTitle}
                                aria-label={t.projects.editor.offerTitle}
                                className="w-full bg-transparent text-sm font-semibold text-content-primary outline-none placeholder:font-normal placeholder:text-content-disabled"
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
                                className="w-full resize-none bg-transparent text-xs text-content-secondary outline-none placeholder:text-content-disabled"
                            />

                            <div className="flex items-center gap-2">
                                <span className="shrink-0 text-xs text-content-tertiary">
                                    {t.projects.editor.expires}
                                </span>
                                <DatePicker
                                    value={offer.expiresAt}
                                    disabled={disabled}
                                    onChange={(value) => patch(offer.id, { expiresAt: value })}
                                    placeholder={t.projects.editor.expiresPlaceholder}
                                    containerClassName="w-[126px]"
                                />
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
                            <Switch
                                checked={offer.enabled}
                                disabled={disabled}
                                onChange={(event) =>
                                    patch(offer.id, { enabled: event.target.checked })
                                }
                                aria-label={t.projects.editor.offerEnabled}
                            />

                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(offers.filter((e) => e.id !== offer.id))}
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

            {/* 873:51305 repeats the Highlights label verbatim; this one says
                what it actually adds. */}
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
                    {t.projects.editor.addOffer}
                </Button>
            </div>
        </section>
    );
}
