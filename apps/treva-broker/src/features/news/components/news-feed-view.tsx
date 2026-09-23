"use client";

import { Newspaper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { routes } from "@/config/routes";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { isApiError } from "@/lib/api/errors";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { useCreateNews, useDeleteNews, useNewsList } from "../hooks/use-news";
import type { NewsPost } from "../types";
import { NewsCard } from "./news-card";
import { NewsSideRail } from "./news-side-rail";

const PER_PAGE = 6;

/**
 * The News Feed screen for every role (`Main Container`, 873:49177).
 *
 * Two white-at-50% panels on Background/Secondary, 12px apart with 2px of the
 * ground showing at either end: the scrolling `main content area` (16px
 * padding) and the 259px `Rightside` rail. The grey band between them is that
 * 12px gap, not a divider.
 *
 * Broker, Top Broker and Admin all render this exact component — what differs
 * is which buttons `can()` lets through, which is the whole reason this app has
 * one route tree instead of three.
 */
export function NewsFeedView() {
    const { locale, t } = useI18n();
    const router = useRouter();
    const { can } = useSession();
    const toast = useToast();
    const [page, setPage] = useState(1);

    const listQuery = useNewsList({ page, perPage: PER_PAGE });
    const deleteNews = useDeleteNews();
    const createNews = useCreateNews();
    const confirmDelete = useConfirm<NewsPost>();

    function performDelete() {
        const post = confirmDelete.target;
        if (!post) return;

        deleteNews.mutate(post.id, { onSettled: confirmDelete.dismiss });
    }

    // The duplicate keeps the original's status (and schedule, if any) rather
    // than always landing as a draft: Quick Stats only counts live posts, so a
    // copy of a published article needs to publish immediately to show up
    // there — the whole point of duplicating a live announcement.
    async function handleCopy(post: NewsPost) {
        try {
            await createNews.mutateAsync({
                title: `${post.title} ${t.news.copySuffix}`,
                excerpt: post.excerpt,
                body: post.body,
                category: post.category,
                coverImageUrl: post.coverImageUrl,
                attachments: post.attachments,
                visibility: post.visibility,
                language: post.language,
                status: post.status,
                publishAt: post.publishAt,
                expiresAt: post.expiresAt,
            });
            toast.success(t.news.copied);
        } catch (copyError) {
            toast.error(isApiError(copyError) ? copyError.message : t.common.error);
        }
    }

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex h-full min-h-0 gap-3 bg-bg-secondary px-0.5">
            <div className="scrollbar-none flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto bg-bg-primary/50 p-4">
                {can("news:create") ? (
                    // `headline` (873:49179): 8px padding, action flush right.
                    <div className="flex shrink-0 justify-end p-2">
                        <Button
                            size="lg"
                            className="rounded-lg border border-border-inverse px-[13px]"
                            leadingIcon={<AssetIcon src="/images/news/icon-plus.svg" size={16} />}
                            onClick={() => router.push(routes.newsNew(locale))}
                        >
                            {t.news.add}
                        </Button>
                    </div>
                ) : null}

                {listQuery.isPending ? (
                    <div className="px-2">
                        <CardGridSkeleton count={PER_PAGE} />
                    </div>
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
                        {/* `Card Container` (916:12427): 263px cards, 24px apart
                            both ways, inset 8px. At the artboard's width that is
                            exactly three columns of 263; wider screens add
                            columns rather than stretching the cards. */}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(263px,1fr))] items-start gap-6 px-2">
                            {data.items.map((post) => (
                                <NewsCard
                                    key={post.id}
                                    post={post}
                                    onDelete={confirmDelete.ask}
                                    onCopy={handleCopy}
                                    onEdit={(entry) => router.push(routes.newsEdit(locale, entry.id))}
                                />
                            ))}
                        </div>

                        {/* The artboard has a single page and draws no pager, so
                            one only appears once there is somewhere to go. */}
                        {data.totalPages > 1 ? (
                            <Pagination
                                page={data.page}
                                totalPages={data.totalPages}
                                onPageChange={setPage}
                                summary={interpolate(t.common.showing, { from, to, total: data.total })}
                                className="mt-auto px-2 pt-2"
                            />
                        ) : null}
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
