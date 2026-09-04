"use client";

import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useBuildings } from "../hooks/use-floor-plan";
import type { BuildingSummary } from "../types";

/** One 260x324 card (886:16162). */
function ListingCard({ building }: { building: BuildingSummary }) {
    const { locale, t } = useI18n();

    return (
        <Link
            href={routes.floorPlanBuilding(locale, building.id)}
            className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-primary px-2 pt-2 pb-3 transition-shadow hover:shadow-l2"
        >
            <div className="relative h-50 w-full overflow-hidden rounded-xl bg-bg-secondary">
                {building.imageUrl ? (
                    <Image
                        src={building.imageUrl}
                        alt=""
                        fill
                        sizes="260px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-content-disabled">
                        <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                    </span>
                )}

                {/* The floor-count chip sits 8 in from the image's top left. */}
                <span className="absolute top-2 left-2 rounded-xl bg-bg-tertiary px-2 py-1 text-xs text-content-tertiary">
                    {interpolate(t.floorPlan.listing.floors, { count: building.floors })}
                </span>
            </div>

            <div className="flex flex-col gap-3 px-1">
                <span className="truncate text-base font-semibold text-content-primary">
                    {building.projectName}
                </span>

                {/* A full-width grey bar, not a plain line of text (898:12636). */}
                <span className="flex h-7 w-full items-center justify-center rounded-lg bg-bg-tertiary text-sm font-semibold text-content-primary">
                    {formatCurrency(building.priceFrom, locale)}
                </span>

                <span className="flex items-center gap-1 truncate text-sm text-content-brand">
                    <b className="font-semibold">{building.name}</b>
                    <span aria-hidden>•</span>
                    <span className="font-medium">
                        {interpolate(t.floorPlan.listing.units, {
                            count: formatNumber(building.unitsTotal, locale),
                        })}
                    </span>
                </span>
            </div>
        </Link>
    );
}

/**
 * Listings — the screen Floor Plan opens on (artboard 886:15740).
 *
 * Buildings grouped by their project: a 36px heading carrying the project name,
 * then that project's buildings four across, 24 apart. Picking one opens its
 * floor plan, which is the only navigation the artboard row implies — Listings
 * sits at the head of the Floor Plan sequence.
 *
 * There is no tab strip here; the tabs belong to the building screen.
 */
export function ListingsView() {
    const { t } = useI18n();
    const buildingsQuery = useBuildings();

    const buildings = buildingsQuery.data ?? [];

    // Group in first-seen order so the sections follow the fixture order rather
    // than an alphabetical one the design does not ask for.
    const projects = buildings.reduce<{ name: string; buildings: BuildingSummary[] }[]>(
        (groups, building) => {
            const group = groups.find((entry) => entry.name === building.projectName);
            if (group) group.buildings.push(building);
            else groups.push({ name: building.projectName, buildings: [building] });
            return groups;
        },
        [],
    );

    if (buildingsQuery.isPending) {
        return (
            <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
                <div className="grid gap-6 px-2 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-81 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (buildingsQuery.isError) {
        return (
            <div className="px-4 pt-4 pb-8">
                <EmptyState
                    icon={<LayoutGrid />}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => buildingsQuery.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
            {projects.map((project) => (
                <section key={project.name} className="flex flex-col">
                    {/* 886:15756 — 36 tall, the name inset 8. */}
                    <div className="flex h-9 items-center px-2">
                        <p className="truncate text-base font-medium text-content-primary">
                            {project.name}
                        </p>
                    </div>

                    <div className="grid gap-6 px-2 sm:grid-cols-2 xl:grid-cols-4">
                        {project.buildings.map((building) => (
                            <ListingCard key={building.id} building={building} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
