"use client";

import { Building2, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useProjectsList } from "../hooks/use-projects";
import type { ProjectListQuery } from "../types";
import { ProjectCard } from "./project-card";

type StatusTab = NonNullable<ProjectListQuery["status"]>;

const PER_PAGE = 8;

/** Projects — a four-across card grid, matching artboard 873:49133. */
export function ProjectsView() {
    const { t } = useI18n();
    const { can } = useSession();

    const [status, setStatus] = useState<StatusTab>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 300);
    const listQuery = useProjectsList({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        status,
    });

    const tabs: TabItem<StatusTab>[] = [
        { value: "all", label: t.common.all },
        { value: "planning", label: t.projects.status.planning },
        { value: "construction", label: t.projects.status.construction },
        { value: "ready", label: t.projects.status.ready },
        { value: "soldOut", label: t.projects.status.soldOut },
    ];

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                    items={tabs}
                    value={status}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                />

                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={t.projects.searchPlaceholder}
                        aria-label={t.projects.searchPlaceholder}
                        leadingIcon={<Search />}
                        containerClassName="w-70"
                    />

                    {can("projects:create") ? (
                        <Button leadingIcon={<Plus />}>{t.projects.add}</Button>
                    ) : null}
                </div>
            </div>

            {listQuery.isPending ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: PER_PAGE }, (_, index) => (
                        <Skeleton key={index} className="h-92 rounded-lg" />
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.items.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>

                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                        summary={interpolate(t.common.showing, { from, to, total: data.total })}
                    />
                </>
            ) : (
                <EmptyState
                    icon={<Building2 />}
                    title={t.common.empty}
                    description={t.common.emptyHint}
                />
            )}
        </div>
    );
}
