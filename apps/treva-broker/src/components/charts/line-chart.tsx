"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface LinePoint {
    label: string;
    value: number;
}

export interface LineChartProps {
    points: readonly LinePoint[];
    /** Formats the value in the tooltip and on the y axis. */
    format: (value: number) => string;
    /** Names the series — a single-series chart needs no legend box. */
    caption?: string;
    className?: string;
    height?: number;
}

const PADDING = { top: 12, right: 12, bottom: 26, left: 56 };
const VIEW_WIDTH = 692;

/**
 * Single-series line chart, hand-rolled in SVG.
 *
 * No charting library: one line and one donut is not worth 40kB of runtime, and
 * inline SVG keeps every colour on the design tokens instead of a library theme.
 *
 * Deliberate choices, per the dataviz rules:
 *  - one y axis, never two;
 *  - one series, so no legend — the caption names it;
 *  - recessive grid (subtle horizontal rules only, no vertical ones);
 *  - crosshair + tooltip on hover, because an SVG chart in a browser should be
 *    inspectable rather than a picture;
 *  - the mark colour is the brand ink, which clears 3:1 on the white surface.
 */
export function LineChart({ points, format, caption, className, height = 228 }: LineChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const geometry = useMemo(() => {
        const values = points.map((point) => point.value);
        const max = Math.max(...values, 0);
        const min = Math.min(...values, 0);

        // A flat series would divide by zero; give it a nominal band instead.
        const span = max - min || 1;
        const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
        const plotHeight = height - PADDING.top - PADDING.bottom;

        const coords = points.map((point, index) => ({
            ...point,
            x:
                PADDING.left +
                (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth),
            y: PADDING.top + plotHeight - ((point.value - min) / span) * plotHeight,
        }));

        const ticks = [0, 0.5, 1].map((ratio) => ({
            value: min + span * ratio,
            y: PADDING.top + plotHeight - ratio * plotHeight,
        }));

        return { coords, ticks, plotHeight };
    }, [points, height]);

    if (points.length === 0) return null;

    const linePath = geometry.coords
        .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
        .join(" ");

    const areaPath = `${linePath} L${geometry.coords.at(-1)!.x.toFixed(2)},${(
        PADDING.top + geometry.plotHeight
    ).toFixed(2)} L${geometry.coords[0]!.x.toFixed(2)},${(PADDING.top + geometry.plotHeight).toFixed(2)} Z`;

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
                    <g key={tick.y}>
                        <line
                            x1={PADDING.left}
                            x2={VIEW_WIDTH - PADDING.right}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="var(--color-chart-grid)"
                            strokeWidth={1}
                        />
                        <text
                            x={PADDING.left - 8}
                            y={tick.y + 4}
                            textAnchor="end"
                            className="fill-content-tertiary text-[10px]"
                        >
                            {format(tick.value)}
                        </text>
                    </g>
                ))}

                <path d={areaPath} fill="var(--color-chart-line)" opacity={0.06} />
                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--color-chart-line)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {geometry.coords.map((point, index) => (
                    <text
                        key={point.label}
                        x={point.x}
                        y={height - 8}
                        textAnchor="middle"
                        className="fill-content-tertiary text-[10px]"
                    >
                        {/* Every other label, so months never collide. */}
                        {index % 2 === 0 ? point.label : ""}
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
                            r={5}
                            fill="var(--color-chart-line)"
                            stroke="var(--color-bg-primary)"
                            strokeWidth={2}
                        />
                    </>
                ) : null}
            </svg>

            {active ? (
                <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-s border border-border-subtle bg-bg-primary px-2 py-1 text-xs shadow-l2"
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
