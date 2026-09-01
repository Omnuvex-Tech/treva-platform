"use client";

import { Newspaper, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useConfirm } from "@/hooks/use-confirm";
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
    const { locale, t } = useI18n();
    const router = useRouter();
    const { can } = useSession();
    const [page, setPage] = useState(1);

    const listQuery = useNewsList({ page, perPage: PER_PAGE });
    const deleteNews = useDeleteNews();
    const confirmDelete = useConfirm<NewsPost>();

    function performDelete() {
        const post = confirmDelete.target;
        if (!post) return;

        deleteNews.mutate(post.id, { onSettled: confirmDelete.dismiss });
    }

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        // min-h-full, not h-full: a fixed height would pin the column to the
        // viewport, so its bottom padding would sit above the overflowing
        // content instead of after it. Stretching still lets the pagination's
        // mt-auto push to the bottom when the list is short.
        <div className="flex min-h-full gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-8">
                {can("news:create") ? (
                    <div className="flex justify-end">
                        <Button leadingIcon={<Plus />} onClick={() => router.push(routes.newsNew(locale))}>
                            {t.news.add}
                        </Button>
                    </div>
                ) : null}

                {listQuery.isPending ? (
                    <CardGridSkeleton count={PER_PAGE} />
                ) : listQuery.isError ? (
                    <EmptyState
                        icon={<Newspaper />}
                        title={t.common.error}
                        action={
                            <Button variant="outline" onClick={() => listQuery.refetch()}>
                                {t.common.retry}
                            </Button>
                        }
                    />
                ) : data && data.items.length > 0 ? (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                            {data.items.map((post) => (
                                <NewsCard
                                    key={post.id}
                                    post={post}
                                    onDelete={confirmDelete.ask}
                                    onEdit={(entry) => router.push(routes.newsEdit(locale, entry.id))}
                                />
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
                    <EmptyState icon={<Newspaper />} title={t.common.empty} description={t.common.emptyHint} />
                )}
            </div>

            <NewsSideRail />

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.common.deleteIrreversible}
                subject={confirmDelete.target?.title}
                confirmLabel={t.common.confirmDelete}
                loading={deleteNews.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
