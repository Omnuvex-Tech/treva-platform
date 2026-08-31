"use client";

import { Pin } from "lucide-react";

import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/providers/i18n-provider";
import { usePinnedNews, useNewsStats } from "../hooks/use-news";

/** The right-hand rail of the News Feed screen: Pinned + Quick Stats. */
export function NewsSideRail() {
    const { locale, t } = useI18n();
    const pinnedQuery = usePinnedNews();
    const statsQuery = useNewsStats();

    return (
        <aside className="flex w-70 shrink-0 flex-col gap-4 border-l border-border-subtle p-6">
            <section>
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-content-tertiary">
                    <Pin className="size-3.5" />
                    {t.news.pinned}
                </h2>

                {pinnedQuery.isPending ? (
                    <Skeleton className="h-24 w-full rounded-lg" />
                ) : pinnedQuery.data?.length ? (
                    <div className="flex flex-col gap-2">
                        {pinnedQuery.data.map((post) => (
                            <Card key={post.id}>
                                <CardContent className="p-3">
                                    <Badge tone="notice">{t.news.categoryAnnouncement}</Badge>
                                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-content-primary">
                                        {post.title}
                                    </p>
                                    <p className="mt-1 text-xs text-content-tertiary">
                                        {formatDate(post.publishedAt, locale)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-content-tertiary">{t.common.empty}</p>
                )}
            </section>

            <section>
                <h2 className="mb-2 text-xs font-medium text-content-tertiary">{t.news.quickStats}</h2>

                <Card>
                    {statsQuery.isPending ? (
                        <CardContent className="space-y-2 p-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    ) : statsQuery.data ? (
                        <dl className="divide-y divide-border-subtle">
                            <StatRow label={t.news.postsThisWeek} value={statsQuery.data.postsThisWeek} />
                            <StatRow label={t.news.unread} value={statsQuery.data.unread} />
                            <StatRow label={t.news.newToday} value={statsQuery.data.newToday} />
                        </dl>
                    ) : null}
                </Card>
            </section>
        </aside>
    );
}

function StatRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <dt className="text-xs text-content-tertiary">{label}</dt>
            <dd className="text-xs font-semibold text-content-primary">{value}</dd>
        </div>
    );
}
