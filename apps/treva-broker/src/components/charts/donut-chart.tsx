"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface DonutSlice {
    label: string;
    value: number;
}

export interface DonutChartProps {
    slices: readonly DonutSlice[];
    format: (value: number) => string;
    /** Rendered in the hole — the headline the chart is about. */
    centerLabel?: string;
    centerValue?: string;
    className?: string;
}

const SIZE = 172;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** 2px of surface between neighbouring segments, per the mark spec. */
const GAP = 2;

/**
 * Composition donut.
 *
 * Colours are assigned from --color-chart-1..4 **in fixed order**, so a slice
 * keeps its colour when a filter removes another one. A legend is always
 * rendered (>= 2 series) and each entry is directly labelled with its share, so
 * identity never rests on colour alone.
 *
 * Five or more categories do not belong here — fold the tail into "Other" or
 * switch to a bar chart, rather than inventing a fifth hue.
 */
export function DonutChart({
    slices,
    format,
    centerLabel,
    centerValue,
    className,
}: DonutChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const { segments, total } = useMemo(() => {
        const sum = slices.reduce((accumulator, slice) => accumulator + slice.value, 0);
        let offset = 0;

        const computed = slices.map((slice, index) => {
            const share = sum === 0 ? 0 : slice.value / sum;
            const length = share * CIRCUMFERENCE;
            const segment = {
                ...slice,
                share,
                color: `var(--color-chart-${(index % 4) + 1})`,
                // dasharray draws `length - GAP` then leaves the rest empty; the
                // offset walks each segment round the circle.
                dashArray: `${Math.max(0, length - GAP)} ${CIRCUMFERENCE - Math.max(0, length - GAP)}`,
                dashOffset: -offset,
            };
            offset += length;
            return segment;
        });

        return { segments: computed, total: sum };
    }, [slices]);

    if (slices.length === 0) return null;

    return (
        <div className={cn("flex items-center gap-5", className)}>
            <div className="relative shrink-0">
                <svg
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    role="img"
                    aria-label={centerLabel}
                >
                    {/* -90deg so the first segment starts at 12 o'clock. */}
                    <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                        {segments.map((segment, index) => (
                            <circle
                                key={segment.label}
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={activeIndex === index ? STROKE + 4 : STROKE}
                                strokeDasharray={segment.dashArray}
                                strokeDashoffset={segment.dashOffset}
                                className="transition-[stroke-width] duration-150"
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            />
                        ))}
                    </g>
                </svg>

                {centerValue ? (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-semibold text-content-primary">
                            {centerValue}
                        </span>
                        {centerLabel ? (
                            <span className="text-2xs text-content-tertiary">{centerLabel}</span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <ul className="flex min-w-0 flex-col gap-2">
                {segments.map((segment, index) => (
                    <li
                        key={segment.label}
                        className={cn(
                            "flex items-center gap-2 text-xs transition-opacity",
                            activeIndex !== null && activeIndex !== index && "opacity-50",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: segment.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-content-secondary">
                            {segment.label}
                        </span>
                        <span className="font-semibold text-content-primary">
                            {Math.round(segment.share * 100)}%
                        </span>
                    </li>
                ))}

                <li className="mt-1 flex items-center justify-between gap-2 border-t border-border-subtle pt-2 text-xs">
                    <span className="text-content-tertiary">Total</span>
                    <span className="font-semibold text-content-primary">{format(total)}</span>
                </li>
            </ul>
        </div>
    );
}
