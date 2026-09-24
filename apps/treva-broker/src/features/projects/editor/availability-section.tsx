"use client";

import { Switch } from "@/components/ui/switch";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { ProjectAvailability } from "../types";
import { SectionHeader } from "./section-header";

type Bucket = "available" | "reserved" | "sold";

const BUCKETS: readonly Bucket[] = ["available", "reserved", "sold"];

/**
 * The three tones the section is drawn in (873:51377 / 873:51386 / 873:51395).
 *
 * The rule and the legend dot use Content/Positive, Notice and Negative; the
 * percentage under each number uses the darkened "bold" step of the same hue,
 * which is what keeps 12px text legible on white.
 */
const BUCKET_STYLE: Record<Bucket, { mark: string; percent: string }> = {
    available: { mark: "bg-content-positive", percent: "text-content-positive-bold" },
    reserved: { mark: "bg-content-notice", percent: "text-[var(--color-content-notice-bold)]" },
    sold: { mark: "bg-content-negative", percent: "text-[var(--color-content-negative-bold)]" },
};

/** Both cards here edge in Background/Secondary, not Border/Subtle. */
const CARD = "rounded-[14px] border border-bg-secondary bg-bg-primary p-4";

export interface AvailabilitySectionProps {
    availability: ProjectAvailability;
    onChange: (availability: ProjectAvailability) => void;
    disabled?: boolean;
}

/**
 * Live Availability (873:51366).
 *
 * Three 174.25-wide stat cards 12 apart, centred as a group in the column
 * rather than stretched across it — a 32x4 rule, a 31px label paragraph
 * (10/Medium with 12 above and 4 below), the 40-tall 32/Bold count and the
 * share of the total. Under them, a 10px stacked bar and its legend in one
 * card. Every card's 17px inset is measured from the outer edge.
 *
 * The counts are number inputs, not read-outs: the artboard draws them inside
 * "Number Input" frames and puts an Auto Calculate switch beside the heading,
 * which only makes sense if they can also be typed. With the switch on they are
 * read-only and follow the inventory.
 */
export function AvailabilitySection({
    availability,
    onChange,
    disabled,
}: AvailabilitySectionProps) {
    const { locale, t } = useI18n();

    const total = availability.available + availability.reserved + availability.sold;
    const share = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

    const locked = disabled || availability.autoCalculate;

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                title={t.projects.editor.availability}
                description={t.projects.editor.availabilityHint}
                // 873:51373 — the labelled Toggle: 4 from its 16/Regular label.
                action={
                    <Switch
                        label={t.projects.editor.autoCalculate}
                        checked={availability.autoCalculate}
                        disabled={disabled}
                        onChange={(event) =>
                            onChange({ ...availability, autoCalculate: event.target.checked })
                        }
                    />
                }
            />

            {/* 873:51374 — a 124-tall row the 125.5 cards are centred in, so
                they overhang it by 0.75 either side, exactly as drawn. The
                cards' own content (127) runs past their frame the same way. */}
            <div className="flex items-center px-2 sm:h-[124px]">
                <div className="mx-auto grid max-w-full gap-3 sm:w-[546.75px] sm:grid-cols-3">
                    {BUCKETS.map((bucket) => (
                        <div
                            key={bucket}
                            // shrink-0 on every child: squeezing 127 of content
                            // into the 125.5 frame would shave the label row.
                            className={cn(
                                "flex flex-col items-start sm:h-[125.5px] [&>*]:shrink-0",
                                CARD,
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn("h-1 w-8 rounded-pill", BUCKET_STYLE[bucket].mark)}
                            />

                            <label
                                htmlFor={`availability-${bucket}`}
                                className="block h-[31px] pt-3 pb-1 text-2xs font-medium text-content-tertiary"
                            >
                                {t.projects.editor.buckets[bucket]}
                            </label>

                            <input
                                id={`availability-${bucket}`}
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={availability[bucket]}
                                readOnly={locked}
                                onChange={(event) =>
                                    onChange({
                                        ...availability,
                                        [bucket]: Math.max(0, Number(event.target.value) || 0),
                                    })
                                }
                                className="block h-10 w-full bg-transparent p-0 text-3xl font-bold text-content-primary outline-none read-only:cursor-default [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />

                            <span className={cn("text-xs font-semibold", BUCKET_STYLE[bucket].percent)}>
                                {interpolate(t.projects.editor.shareOfTotal, {
                                    percent: share(availability[bucket]),
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 873:51404 — a 10px bar over a legend, both inside one card. */}
            <div className="px-2">
                <div className={CARD}>
                    <div
                        role="img"
                        aria-label={t.projects.editor.availability}
                        className="flex h-2.5 w-full overflow-hidden rounded-pill bg-bg-tertiary"
                    >
                        {BUCKETS.map((bucket) => (
                            <span
                                key={bucket}
                                className={BUCKET_STYLE[bucket].mark}
                                style={{ width: `${share(availability[bucket])}%` }}
                            />
                        ))}
                    </div>

                    {/* 873:51409 — 24 between items, 6 from the 8px dot, the
                        label on Content/Brand and the count on Content/Primary,
                        both 12/Medium. */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3">
                        {BUCKETS.map((bucket) => (
                            <span
                                key={bucket}
                                className="flex items-center gap-1.5 text-xs font-medium text-content-brand"
                            >
                                <span
                                    aria-hidden
                                    className={cn("size-2 rounded-pill", BUCKET_STYLE[bucket].mark)}
                                />
                                <span>
                                    {t.projects.editor.buckets[bucket]}{" "}
                                    <span className="text-content-primary">
                                        {formatNumber(availability[bucket], locale)}
                                    </span>
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
