"use client";

import { Clock01Icon, Delete02Icon, Location01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building2 } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatNumber, formatRelativeTime } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { Project, ProjectStatus } from "../types";

const STATUS_TONE: Record<ProjectStatus, "positive" | "neutral"> = {
    active: "positive",
    inactive: "neutral",
};

export interface ProjectCardProps {
    project: Project;
    onDelete?: (project: Project) => void;
    /**
     * Optional on purpose, and unwired for now. The artboard draws the Edit
     * button but the file has no project editor to send it to, so there is
     * nowhere for the click to go yet. The button is still rendered: dropping
     * it would make the card differ from the artboard in a way that reads as
     * unfinished rather than as a deliberate gap.
     */
    onEdit?: (project: Project) => void;
}

/**
 * One 260x368 card from the Projects grid (I873:49156).
 *
 * The card is padded 8 on three sides and 12 at the bottom, with a 4XL radius
 * that the 200px cover repeats. Two controls sit over the cover — the status
 * pill left, a 32px delete chip right — and the body below is a 24px gap
 * between the three text lines and the footer row.
 *
 * The footer's two controls are both 28 tall: a grey clock chip carrying how
 * long ago the project changed, and the brand Edit button.
 */
export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    return (
        <article className="flex h-92 flex-col gap-3 rounded-xl border border-border-subtle bg-bg-primary px-2 pt-2 pb-3">
            {/* I873:49156;13186:128 — 200 tall, same 4XL radius as the card. */}
            <div className="relative h-50 w-full shrink-0 overflow-hidden rounded-xl bg-bg-secondary">
                {project.coverImageUrl ? (
                    <Image
                        src={project.coverImageUrl}
                        alt=""
                        fill
                        sizes="260px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-content-disabled">
                        <Building2 className="size-8" />
                    </span>
                )}

                {/* I873:49156;13186:129 — inset 8 from the cover's own edges. */}
                <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                    <Badge
                        tone={STATUS_TONE[project.status]}
                        // 12/Medium sentence case, not the 10px uppercase pill
                        // the news cards use.
                        className="px-2 py-1 text-xs font-medium tracking-normal normal-case"
                    >
                        {t.projects.status[project.status]}
                    </Badge>

                    {can("projects:delete") && onDelete ? (
                        <button
                            type="button"
                            aria-label={t.common.delete}
                            title={t.common.delete}
                            onClick={() => onDelete(project)}
                            className="flex h-8 shrink-0 items-center justify-center rounded-xl bg-bg-tertiary px-2 text-content-secondary transition-colors hover:bg-border-tertiary"
                        >
                            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* I873:49156;13186:134 — inset 4, with 24 between the two blocks. */}
            <div className="flex flex-1 flex-col justify-between gap-6 px-1">
                <div className="flex min-w-0 flex-col gap-3">
                    <h3 className="truncate text-base font-semibold text-content-primary">
                        {project.name}
                    </h3>

                    <p className="flex min-w-0 items-center gap-1 text-sm font-medium text-content-brand">
                        <HugeiconsIcon
                            icon={Location01Icon}
                            size={16}
                            strokeWidth={1.6}
                            className="shrink-0"
                        />
                        <span className="truncate">{project.location}</span>
                    </p>

                    {/* The two counts read as one line, split by a 4px dot. */}
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-content-brand">
                        <span className="truncate">
                            {interpolate(t.projects.unitsTotal, {
                                total: formatNumber(project.unitsTotal, locale),
                            })}
                        </span>
                        <span aria-hidden className="size-1 shrink-0 rounded-pill bg-content-tertiary" />
                        <span className="truncate">
                            {interpolate(t.projects.unitsAvailable, {
                                available: formatNumber(project.unitsAvailable, locale),
                            })}
                        </span>
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="flex h-7 shrink-0 items-center gap-1 rounded-lg bg-bg-tertiary px-2 text-sm font-semibold text-content-primary">
                        <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={1.6} />
                        {formatRelativeTime(project.updatedAt, locale)}
                    </span>

                    {can("projects:update") ? (
                        <Button
                            size="chip"
                            className="shrink-0"
                            leadingIcon={
                                <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.6} />
                            }
                            onClick={() => onEdit?.(project)}
                        >
                            {t.common.edit}
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
