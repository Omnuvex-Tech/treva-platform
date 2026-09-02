"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteProject, useProjectsList } from "../hooks/use-projects";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

const PER_PAGE = 8;

/**
 * Projects — a four-across card grid (artboard 873:49133).
 *
 * Two blocks with no gap between them: a 60px headline whose row is inset 8,
 * then the grid at y76 — the breathing room under the title is the headline's
 * own padding, not a margin. The grid is 1112 wide inside the 1128 column, so
 * four 260 cards and three 24px gutters land exactly.
 *
 * The artboard draws neither the status tabs nor the search box an earlier pass
 * put here, so both are gone; the service still filters by name, developer,
 * location and status, so restoring either is a matter of rendering the control
 * and threading the value back into `useProjectsList`.
 *
 * Pagination is not drawn either — eight cards fill the two rows exactly — but
 * it stays, because the fixtures already run past one page.
 */
export function ProjectsView() {
    const { t } = useI18n();
    const { can } = useSession();

    const [page, setPage] = useState(1);

    const listQuery = useProjectsList({ page, perPage: PER_PAGE });
    const deleteProject = useDeleteProject();
    const confirmDelete = useConfirm<Project>();

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    function performDelete() {
        const project = confirmDelete.target;
        if (!project) return;

        deleteProject.mutate(project.id, { onSettled: confirmDelete.dismiss });
    }

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            {/* 873:49151 — 60 tall, the name left and the action right, both
                inset 8. The artboard's own label reads "Broker Role", left over
                from the screen it was copied from; the section's real title is
                what belongs here. */}
            <div className="flex h-15 items-center justify-between gap-3 px-2">
                <p className="truncate text-base font-medium text-content-primary">
                    {t.projects.title}
                </p>

                {can("projects:create") ? (
                    <Button
                        size="lg"
                        // 164x44 with a 3XL radius — the shared `lg` size rounds
                        // to 12px, this button is 16.
                        className="shrink-0 rounded-lg border border-border-inverse px-3.5"
                        leadingIcon={<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />}
                    >
                        {t.projects.add}
                    </Button>
                ) : null}
            </div>

            <div className="px-2">
                {listQuery.isPending ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: PER_PAGE }, (_, index) => (
                            <Skeleton key={index} className="h-92 rounded-xl" />
                        ))}
                    </div>
                ) : listQuery.isError ? (
                    <EmptyState
                        icon={<Building2 />}
                        title={t.common.error}
                        action={
                            <Button variant="outline" onClick={() => listQuery.refetch()}>
                                {t.common.retry}
                            </Button>
                        }
                    />
                ) : data && data.items.length > 0 ? (
                    <>
                        {/* 992:11605 — 260 cards, 24 apart, two rows also 24
                            apart. At the design's width that is exactly four. */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {data.items.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onDelete={confirmDelete.ask}
                                />
                            ))}
                        </div>

                        {data.totalPages > 1 ? (
                            <Pagination
                                className="mt-6"
                                page={data.page}
                                totalPages={data.totalPages}
                                onPageChange={setPage}
                                summary={interpolate(t.common.showing, {
                                    from,
                                    to,
                                    total: data.total,
                                })}
                            />
                        ) : null}
                    </>
                ) : (
                    <EmptyState
                        icon={<Building2 />}
                        title={t.common.empty}
                        description={t.common.emptyHint}
                    />
                )}
            </div>

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.projects.deleteConfirm}
                subject={confirmDelete.target?.name}
                confirmLabel={t.common.confirmDelete}
                loading={deleteProject.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
