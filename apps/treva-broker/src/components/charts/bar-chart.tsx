"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface BarDatum {
    label: string;
    value: number;
}

export interface BarChartProps {
    data: readonly BarDatum[];
    /** Formats the value on the axis and in the tooltip. */
    format: (value: number) => string;
    /** Names the series — a single-series chart needs no legend. */
    caption?: string;
    className?: string;
}

/**
 * The artboard's chart box is 300x194: names right-aligned in the first 121px,
 * bars from 128 to the right edge, the axis row at 182.
 */
const VIEW = { width: 300, height: 194 };
const PLOT_LEFT = 128;
const LABEL_RIGHT = 121;
const AXIS_Y = 190;
const BAR_HEIGHT = 31.6;
const BAR_GAP = 9.9;
const TICK_COUNT = 4;

/** 1, 2, 5 x 10^n — the steps that produce round axis labels. */
function niceStep(rough: number): number {
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const normalized = rough / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
}

/**
 * A bar with its far end rounded and its baseline end square, so the mark stays
 * anchored to the axis it is measured from.
 */
function barPath(x: number, y: number, width: number, height: number, radius: number): string {
    const r = Math.max(0, Math.min(radius, width, height / 2));
    return [
        `M${x},${y}`,
        `H${x + width - r}`,
        `A${r},${r} 0 0 1 ${x + width},${y + r}`,
        `V${y + height - r}`,
        `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
        `H${x}`,
        "Z",
    ].join(" ");
}

/**
 * Horizontal bar chart — the Revenue by Project card (1173:18052).
 *
 * Horizontal rather than vertical because the categories are project names:
 * "Panorama by ELIE SAAB" needs a line of its own, and a rotated x-axis label
 * is the thing this layout exists to avoid.
 *
 * Per the dataviz rules: one series and therefore no legend, every bar directly
 * labelled with its project, a recessive dotted grid, bars rounded only at the
 * data end, and a hover tooltip so the exact figure is reachable.
 *
 * The artboard spaces its four axis labels evenly and writes ₼0 / ₼150 / ₼300 /
 * ₼600 across them, which is four labels laid out by hand rather than a scale.
 * The four ticks here are kept and given a linear domain with round steps.
 */
export function BarChart({ data, format, caption, className }: BarChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (data.length === 0) return null;

    const rawMax = Math.max(...data.map((entry) => entry.value), 0);
    const step = niceStep((rawMax || 1) / (TICK_COUNT - 1));
    const max = Math.max(Math.ceil(rawMax / step) * step, step);
    const plotWidth = VIEW.width - PLOT_LEFT;

    const ticks = Array.from({ length: TICK_COUNT }, (_, index) => {
        const value = (max / (TICK_COUNT - 1)) * index;
        return { value, x: PLOT_LEFT + (value / max) * plotWidth };
    });

    const rows = data.map((entry, index) => {
        const y = 8 + index * (BAR_HEIGHT + BAR_GAP);
        return {
            ...entry,
            y,
            centerY: y + BAR_HEIGHT / 2,
            width: (entry.value / max) * plotWidth,
        };
    });

    const active = activeIndex === null ? null : rows[activeIndex];

    return (
        <figure className={cn("relative m-0", className)}>
            <svg
                viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
                className="w-full"
                role="img"
                aria-label={caption}
                onMouseLeave={() => setActiveIndex(null)}
            >
                {ticks.map((tick) => (
                    <line
                        key={`grid-${tick.value}`}
                        x1={tick.x}
                        x2={tick.x}
                        y1={0}
                        y2={VIEW.height - 24}
                        stroke="var(--color-border-tertiary)"
                        strokeWidth={1}
                        strokeDasharray="1 4"
                        strokeLinecap="round"
                    />
                ))}

                {rows.map((row, index) => (
                    <g
                        key={row.label}
                        onMouseEnter={() => setActiveIndex(index)}
                        className="cursor-default"
                    >
                        {/* A full-width hit target, so the thin bars at the
                            bottom of the ranking are no harder to reach. */}
                        <rect
                            x={PLOT_LEFT}
                            y={row.y}
                            width={plotWidth}
                            height={BAR_HEIGHT}
                            fill="transparent"
                        />
                        <path
                            d={barPath(PLOT_LEFT, row.y, row.width, BAR_HEIGHT, 4)}
                            fill="var(--color-bg-brand)"
                            opacity={activeIndex === null || activeIndex === index ? 1 : 0.55}
                        />
                        <text
                            x={LABEL_RIGHT}
                            y={row.centerY + 3.5}
                            textAnchor="end"
                            className="fill-content-tertiary text-[10px]"
                        >
                            {row.label}
                        </text>
                    </g>
                ))}

                {ticks.map((tick, index) => (
                    <text
                        key={`tick-${tick.value}`}
                        x={tick.x}
                        y={AXIS_Y}
                        // The artboard sets the row `justify-between`, so the
                        // outer labels sit inside the plot rather than centred
                        // on their rule and clipped by the card.
                        textAnchor={
                            index === 0 ? "start" : index === ticks.length - 1 ? "end" : "middle"
                        }
                        className="fill-content-tertiary text-[10px]"
                    >
                        {format(tick.value)}
                    </text>
                ))}
            </svg>

            {active ? (
                <div
                    className="pointer-events-none absolute z-10 -translate-y-1/2 rounded-sm border border-border-subtle bg-bg-primary px-2 py-1 text-xs shadow-l2"
                    style={{
                        left: `${((PLOT_LEFT + active.width) / VIEW.width) * 100}%`,
                        top: `${(active.centerY / VIEW.height) * 100}%`,
                    }}
                >
                    <span className="block text-content-tertiary">{active.label}</span>
                    <span className="block font-semibold text-content-primary">
                        {format(active.value)}
                    </span>
                </div>
            ) : null}
        </figure>
    );
}
