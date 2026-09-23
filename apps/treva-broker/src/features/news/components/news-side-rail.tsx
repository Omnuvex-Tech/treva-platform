"use client";

import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/providers/i18n-provider";
import { usePinnedNews, useNewsStats } from "../hooks/use-news";

/**
 * The right-hand rail of the News Feed screen (`Rightside`, 873:49305):
 * 259px of white-at-50%, 20px side and 24px vertical padding, two cards 24px
 * apart. Both cards are white on a 12.75px radius with a Border/Subtle edge,
 * and both label themselves inside the card with a 14/Semibold, Content/
 * Tertiary heading over a rule.
 */
export function NewsSideRail() {
    const { locale, t } = useI18n();
    const pinnedQuery = usePinnedNews();
    const statsQuery = useNewsStats();

    return (
        <aside className="scrollbar-none flex w-rail shrink-0 flex-col gap-6 overflow-y-auto bg-bg-primary/50 px-5 py-6">
            {/* 873:49308 — 13px padding in Figma, where the stroke sits inside the
                frame; 12 here, where the 1px border takes the other pixel. */}
            <section className="flex flex-col items-start gap-2 rounded-[12.75px] border border-border-subtle bg-bg-primary p-3">
                <h2 className="w-full border-b border-border-subtle pt-2 pb-[9px] text-sm font-semibold text-content-tertiary">
                    {t.news.pinned}
                </h2>

                {pinnedQuery.isPending ? (
                    <Skeleton className="h-16 w-full" />
                ) : pinnedQuery.data?.length ? (
                    pinnedQuery.data.map((post) => {
                        const announcement = post.category === "announcement";

                        return (
                            <Link
                                key={post.id}
                                href={routes.newsDetail(locale, post.id)}
                                className="flex w-full flex-col items-start gap-2 rounded-md"
                            >
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-pill px-2 py-1 text-xs font-medium whitespace-nowrap",
                                        announcement
                                            ? "bg-bg-notice-subtle text-content-notice uppercase"
                                            : "bg-bg-positive-subtle text-content-positive",
                                    )}
                                >
                                    {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
                                </span>
                                <p className="max-w-[169px] text-xs font-semibold text-content-primary hover:underline">
                                    {post.title}
                                </p>
                                <p className="text-xs text-content-tertiary">
                                    {formatDate(post.publishedAt, locale)}
                                </p>
                            </Link>
                        );
                    })
                ) : (
                    <p className="text-xs text-content-tertiary">{t.common.empty}</p>
                )}
            </section>

            {/* 873:49317 — the rows carry their own padding; the 1px Figma pads
                is the border here. */}
            <section className="flex flex-col rounded-[12.75px] border border-border-subtle bg-bg-primary">
                <h2 className="border-b border-border-subtle px-3 pt-3 pb-[13px] text-sm font-semibold text-content-tertiary">
                    {t.news.quickStats}
                </h2>

                {statsQuery.isPending ? (
                    <div className="flex flex-col gap-2 px-3 py-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : statsQuery.data ? (
                    <dl>
                        <StatRow label={t.news.postsThisWeek} value={statsQuery.data.postsThisWeek} />
                        <StatRow label={t.news.unread} value={statsQuery.data.unread} />
                        <StatRow label={t.news.newToday} value={statsQuery.data.newToday} last />
                    </dl>
                ) : null}
            </section>
        </aside>
    );
}

/** 873:49321 — 10.5 / 11.5 vertical, 12.25 side; the last row has no rule. */
function StatRow({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
    return (
        <div
            className={cn(
                "flex items-center justify-between px-[12.25px]",
                last ? "py-[10.5px]" : "border-b border-border-subtle pt-[10.5px] pb-[11.5px]",
            )}
        >
            <dt className="text-xs text-content-tertiary">{label}</dt>
            <dd className="text-xs font-semibold text-content-primary">{value}</dd>
        </div>
    );
}
