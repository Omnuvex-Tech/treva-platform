"use client";

import { Newspaper, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteNews, useNewsList } from "../hooks/use-news";
import type { NewsPost } from "../types";
import { NewsCard } from "./news-card";
import { NewsSideRail } from "./news-side-rail";

const PER_PAGE = 6;

/**
 * The News Feed screen for every role.
 *
 * Broker, Top Broker and Admin all render this exact component — what differs
 * is which buttons `can()` lets through, which is the whole reason this app has
 * one route tree instead of three.
 */
export function NewsFeedView() {
    const { t } = useI18n();
    const { can } = useSession();
    const [page, setPage] = useState(1);

    const listQuery = useNewsList({ page, perPage: PER_PAGE });
    const deleteNews = useDeleteNews();

    function handleDelete(post: NewsPost) {
        // Placeholder confirmation until the shared ConfirmDialog lands — the
        // delete is destructive and must not be one stray click away.
        if (!window.confirm(`${t.common.delete}: ${post.title}?`)) return;
        deleteNews.mutate(post.id);
    }

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex h-full">
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
                {can("news:create") ? (
                    <div className="flex justify-end">
                        <Button leadingIcon={<Plus />}>{t.news.add}</Button>
                    </div>
                ) : null}

                {listQuery.isPending ? (
                    <CardGridSkeleton count={PER_PAGE} />
                ) : listQuery.isError ? (
                    <EmptyState
                        icon={Newspaper}
                        title={t.common.error}
                        action={
                            <Button variant="outline" onClick={() => listQuery.refetch()}>
                                {t.common.retry}
                            </Button>
                        }
                    />
                ) : data && data.items.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {data.items.map((post) => (
                                <NewsCard key={post.id} post={post} onDelete={handleDelete} onEdit={() => {}} />
                            ))}
                        </div>

                        <Pagination
                            page={data.page}
                            totalPages={data.totalPages}
                            onPageChange={setPage}
                            summary={interpolate(t.common.showing, { from, to, total: data.total })}
                            className="mt-auto pt-2"
                        />
                    </>
                ) : (
                    <EmptyState icon={Newspaper} title={t.common.empty} description={t.common.emptyHint} />
                )}
            </div>

            <NewsSideRail />
        </div>
    );
}
