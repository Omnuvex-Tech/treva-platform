"use client";

import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Layout } from "../types";

export interface LayoutsGridProps {
    layouts: readonly Layout[];
}

/**
 * The Layouts tab (873:50474).
 *
 * Four drawings across, each card holding the plan with its block chip pinned
 * top right, then the starting price beside the area, and a full-width pill
 * saying how many units share the layout.
 *
 * `planImageUrl` is null in every fixture: the artboard shows real
 * architectural drawings and the repo has no such asset, so the well falls back
 * to a placeholder rather than to an invented plan.
 */
export function LayoutsGrid({ layouts }: LayoutsGridProps) {
    const { locale, t } = useI18n();

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {layouts.map((layout) => (
                <article
                    key={layout.id}
                    className="flex flex-col gap-3 rounded-md border border-border-subtle bg-bg-primary p-3"
                >
                    <div className="relative h-70 w-full overflow-hidden rounded-sm bg-bg-secondary">
                        {layout.planImageUrl ? (
                            <Image
                                src={layout.planImageUrl}
                                alt=""
                                fill
                                sizes="260px"
                                className="object-contain"
                            />
                        ) : (
                            <span className="flex size-full items-center justify-center text-content-disabled">
                                <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                            </span>
                        )}

                        <span className="absolute top-2 right-2 rounded-pill bg-bg-tertiary px-2 py-1 text-xs text-content-secondary">
                            {layout.label}
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-base font-semibold text-content-primary">
                            {interpolate(t.floorPlan.layout.priceFrom, {
                                price: formatCurrency(layout.priceFrom, locale),
                            })}
                        </span>
                        <span className="shrink-0 text-xs text-content-tertiary">
                            {layout.areaSqm} m²
                        </span>
                    </div>

                    <span className="flex h-8 items-center justify-center rounded-pill bg-bg-secondary text-sm text-content-secondary">
                        {interpolate(t.floorPlan.layout.properties, {
                            count: layout.propertyCount,
                        })}
                    </span>
                </article>
            ))}
        </div>
    );
}
