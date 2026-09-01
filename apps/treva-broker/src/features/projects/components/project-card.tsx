"use client";

import Image from "next/image";
import { BedDouble, Building2, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Project, ProjectStatus } from "../types";

const STATUS_TONE: Record<ProjectStatus, "positive" | "notice" | "info" | "neutral"> = {
    ready: "positive",
    construction: "notice",
    planning: "info",
    soldOut: "neutral",
};

/**
 * One 260x368 card from the Projects grid: cover, status pill, name, location,
 * the "from" price, and an availability line.
 */
export function ProjectCard({ project }: { project: Project }) {
    const { locale, t } = useI18n();

    const soldOut = project.unitsAvailable === 0;

    return (
        <article className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-primary transition-shadow hover:shadow-l2">
            <div className="relative aspect-[260/152] w-full bg-bg-secondary">
                {project.coverImageUrl ? (
                    <Image
                        src={project.coverImageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 260px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-content-disabled">
                        <Building2 className="size-8" />
                    </span>
                )}

                <Badge tone={STATUS_TONE[project.status]} className="absolute top-3 left-3">
                    {t.projects.status[project.status]}
                </Badge>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div>
                    <h3 className="truncate text-sm font-semibold text-content-primary">
                        {project.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-content-tertiary">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{project.location}</span>
                    </p>
                </div>

                <p className="text-xs text-content-tertiary">{project.developer}</p>

                <dl className="mt-auto flex flex-col gap-1.5 border-t border-border-subtle pt-3">
                    <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-xs text-content-tertiary">{t.projects.from}</dt>
                        <dd className="text-sm font-semibold text-content-primary">
                            {formatCurrency(project.priceFrom, locale)}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                        <dt className="flex items-center gap-1 text-content-tertiary">
                            <BedDouble className="size-3.5" />
                            {project.bedroomsFrom}–{project.bedroomsTo}
                        </dt>
                        <dd
                            className={
                                soldOut ? "text-content-tertiary" : "text-content-positive-bold"
                            }
                        >
                            {interpolate(t.projects.units, {
                                available: project.unitsAvailable,
                                total: project.unitsTotal,
                            })}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-content-tertiary">
                        <dt className="flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {t.projects.delivery}
                        </dt>
                        <dd>{formatDate(project.deliveryDate, locale)}</dd>
                    </div>
                </dl>
            </div>
        </article>
    );
}
