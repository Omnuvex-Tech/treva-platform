"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface LinePoint {
    label: string;
    value: number;
}

export interface LineChartProps {
    points: readonly LinePoint[];
    /** Formats the value on the y axis and in the tooltip. */
    format: (value: number) => string;
    /** Names the series — a single-series chart needs no legend. */
    caption?: string;
    className?: string;
    height?: number;
}

/**
 * Left is wide enough for "₼ 50,000"; the bottom holds the month row. The
 * artboard's plot starts at x=61 of 692 and leaves 31px under the axis.
 */
const PADDING = { top: 12, right: 4, bottom: 30, left: 62 };
const VIEW_WIDTH = 692;
/** The artboard draws six gridlines (1173:18003). */
const TICK_TARGET = 6;

/** 1, 2, 5 x 10^n — the steps that produce round axis labels. */
function niceStep(rough: number): number {
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const normalized = rough / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
}

/**
 * Catmull-Rom through every point, emitted as cubic curves.
 *
 * The artboard's line is a spline, not a polyline — it eases between months
 * rather than cornering at them. Catmull-Rom is the spline that passes exactly
 * through its points, which a chart needs and a smoothing filter would not give.
 */
function smoothPath(coords: readonly { x: number; y: number }[]): string {
    const first = coords[0];
    if (!first) return "";
    if (coords.length === 1) return `M${first.x},${first.y}`;

    const segments = [`M${first.x.toFixed(2)},${first.y.toFixed(2)}`];

    for (let index = 0; index < coords.length - 1; index += 1) {
        const p1 = coords[index];
        const p2 = coords[index + 1];
        if (!p1 || !p2) continue;

        const p0 = coords[index - 1] ?? p1;
        const p3 = coords[index + 2] ?? p2;

        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;

        segments.push(
            `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`,
        );
    }

    return segments.join(" ");
}

/**
 * Single-series line chart, hand-rolled in SVG — the Sales Trend card
 * (1173:18001).
 *
 * No charting library: one line is not worth 40kB of runtime, and inline SVG
 * keeps every colour on the design tokens instead of a library theme.
 *
 * Deliberate choices, per the dataviz rules:
 *  - one y axis, never two;
 *  - one series, so no legend — the card title names it;
 *  - recessive grid: dotted horizontal rules only, never vertical ones;
 *  - a marker on every month, 10.5px as drawn, filled on the surface grey with
 *    a brand ring so it stays readable where the line passes under it;
 *  - crosshair + tooltip on hover, because an SVG chart in a browser should be
 *    inspectable rather than a picture.
 *
 * The artboard labels its rows ₼50,000 / 45,000 / 30,000 / 25,000 / 15,000 /
 * 10,000 — six evenly spaced rows carrying unevenly spaced values, which is a
 * placeholder rather than a scale. The axis here keeps the six rows and derives
 * round values from the data, so the picture matches and the numbers mean
 * something.
 */
export function LineChart({ points, format, caption, className, height = 228 }: LineChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const geometry = useMemo(() => {
        const values = points.map((point) => point.value);
        const rawMin = values.length ? Math.min(...values) : 0;
        const rawMax = values.length ? Math.max(...values) : 0;

        const step = niceStep((rawMax - rawMin || Math.abs(rawMax) || 1) / (TICK_TARGET - 1));
        const min = Math.floor(rawMin / step) * step;
        const max = Math.max(Math.ceil(rawMax / step) * step, min + step);
        const span = max - min;

        const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
        const plotHeight = height - PADDING.top - PADDING.bottom;

        const coords = points.map((point, index) => ({
            ...point,
            x:
                PADDING.left +
                (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth),
            y: PADDING.top + plotHeight - ((point.value - min) / span) * plotHeight,
        }));

        const ticks: { value: number; y: number }[] = [];
        for (let value = min; value <= max + step / 2; value += step) {
            ticks.push({
                value,
                y: PADDING.top + plotHeight - ((value - min) / span) * plotHeight,
            });
        }

        return { coords, ticks, plotHeight };
    }, [points, height]);

    if (points.length === 0) return null;

    const active = activeIndex === null ? null : geometry.coords[activeIndex];

    function handleMove(event: React.MouseEvent<SVGSVGElement>) {
        const bounds = event.currentTarget.getBoundingClientRect();
        // The SVG scales to its container, so the pointer has to be mapped back
        // into viewBox units before it can be matched against a point.
        const ratio = VIEW_WIDTH / bounds.width;
        const x = (event.clientX - bounds.left) * ratio;

        let nearest = 0;
        let nearestDistance = Infinity;
        geometry.coords.forEach((point, index) => {
            const distance = Math.abs(point.x - x);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = index;
            }
        });

        setActiveIndex(nearest);
    }

    return (
        <figure className={cn("relative m-0", className)}>
            <svg
                viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
                className="w-full"
                role="img"
                aria-label={caption}
                onMouseMove={handleMove}
                onMouseLeave={() => setActiveIndex(null)}
            >
                {geometry.ticks.map((tick) => (
                    <g key={tick.value}>
                        <line
                            x1={PADDING.left}
                            x2={VIEW_WIDTH - PADDING.right}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="var(--color-border-tertiary)"
                            strokeWidth={1}
                            strokeDasharray="1 4"
                            strokeLinecap="round"
                        />
                        <text
                            x={PADDING.left - 10}
                            y={tick.y + 4}
                            textAnchor="end"
                            className="fill-content-primary text-xs"
                        >
                            {format(tick.value)}
                        </text>
                    </g>
                ))}

                <path
                    d={smoothPath(geometry.coords)}
                    fill="none"
                    stroke="var(--color-chart-line)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {geometry.coords.map((point) => (
                    <circle
                        key={`marker-${point.label}`}
                        cx={point.x}
                        cy={point.y}
                        r={5.25}
                        fill="var(--color-bg-secondary)"
                        stroke="var(--color-chart-line)"
                        strokeWidth={1.5}
                    />
                ))}

                {geometry.coords.map((point) => (
                    <text
                        key={`label-${point.label}`}
                        x={point.x}
                        y={height - 8}
                        textAnchor="middle"
                        className="fill-content-primary text-xs"
                    >
                        {point.label}
                    </text>
                ))}

                {active ? (
                    <>
                        <line
                            x1={active.x}
                            x2={active.x}
                            y1={PADDING.top}
                            y2={PADDING.top + geometry.plotHeight}
                            stroke="var(--color-border-tertiary)"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                        />
                        {/* 2px surface ring keeps the marker readable over the line. */}
                        <circle
                            cx={active.x}
                            cy={active.y}
                            r={5.25}
                            fill="var(--color-chart-line)"
                            stroke="var(--color-bg-primary)"
                            strokeWidth={2}
                        />
                    </>
                ) : null}
            </svg>

            {active ? (
                <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-sm border border-border-subtle bg-bg-primary px-2 py-1 text-xs shadow-l2"
                    style={{
                        left: `${(active.x / VIEW_WIDTH) * 100}%`,
                        top: `${(active.y / height) * 100}%`,
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
