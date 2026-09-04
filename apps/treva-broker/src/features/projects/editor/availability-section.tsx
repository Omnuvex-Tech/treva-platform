"use client";

import { Switch } from "@/components/ui/switch";
import { interpolate } from "@/lib/i18n/interpolate";
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

export interface AvailabilitySectionProps {
    availability: ProjectAvailability;
    onChange: (availability: ProjectAvailability) => void;
    disabled?: boolean;
}

/**
 * Live Availability (873:51366).
 *
 * Three 125px stat cards — a 32x4 rule, a 10/Medium label, a 32/Bold count and
 * the share of the total — then a 10px stacked bar and its legend.
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
                action={
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-content-primary">
                        <Switch
                            checked={availability.autoCalculate}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange({ ...availability, autoCalculate: event.target.checked })
                            }
                            aria-label={t.projects.editor.autoCalculate}
                        />
                        {t.projects.editor.autoCalculate}
                    </label>
                }
            />

            <div className="grid gap-3 px-2 sm:grid-cols-3">
                {BUCKETS.map((bucket) => (
                    <div
                        key={bucket}
                        className="flex flex-col items-start rounded-md border border-bg-secondary bg-bg-primary p-[17px]"
                    >
                        <span
                            aria-hidden
                            className={`h-1 w-8 rounded-pill ${BUCKET_STYLE[bucket].mark}`}
                        />

                        <label
                            htmlFor={`availability-${bucket}`}
                            className="pt-3 pb-1 text-2xs font-medium text-content-tertiary"
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
                            className="w-full bg-transparent text-3xl font-bold text-content-primary outline-none read-only:cursor-default [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        <span className={`text-xs font-semibold ${BUCKET_STYLE[bucket].percent}`}>
                            {interpolate(t.projects.editor.shareOfTotal, {
                                percent: share(availability[bucket]),
                            })}
                        </span>
                    </div>
                ))}
            </div>

            {/* 873:51404 — a 10px bar over a legend, both inside one 17px card. */}
            <div className="px-2">
                <div className="rounded-md border border-bg-secondary bg-bg-primary p-[17px]">
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

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3">
                        {BUCKETS.map((bucket) => (
                            <span
                                key={bucket}
                                className="flex items-center gap-1.5 text-xs text-content-secondary"
                            >
                                <span
                                    aria-hidden
                                    className={`size-2 rounded-pill ${BUCKET_STYLE[bucket].mark}`}
                                />
                                {t.projects.editor.buckets[bucket]}{" "}
                                <b className="font-semibold text-content-primary">
                                    {formatNumber(availability[bucket], locale)}
                                </b>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
