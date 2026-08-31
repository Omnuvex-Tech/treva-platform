"use client";

import Image from "next/image";
import { Clock, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { NewsPost } from "../types";

export interface NewsCardProps {
    post: NewsPost;
    onEdit?: (post: NewsPost) => void;
    onDelete?: (post: NewsPost) => void;
}

/**
 * One card in the News Feed grid.
 *
 * This single component covers all three roles: the Edit and delete
 * affordances are gated on `news:update` / `news:delete`, which is exactly the
 * difference between the Broker and the Admin/Top Broker artboards. There is no
 * read-only variant of this card.
 */
export function NewsCard({ post, onEdit, onDelete }: NewsCardProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canEdit = can("news:update");
    const canDelete = can("news:delete");
    const announcement = post.category === "announcement";

    return (
        <article className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-primary">
            {/* 3px accent rail, green for news and amber for announcements. */}
            <span
                aria-hidden
                className={cn(
                    "h-[3px] w-full",
                    announcement ? "bg-content-notice" : "bg-content-positive",
                )}
            />

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <Badge tone={announcement ? "notice" : "positive"}>
                        {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
                    </Badge>

                    {canDelete && onDelete ? (
                        <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`${t.common.delete}: ${post.title}`}
                            onClick={() => onDelete(post)}
                            className="text-content-tertiary hover:text-content-negative"
                        >
                            <Trash2 />
                        </Button>
                    ) : null}
                </div>

                {post.coverImageUrl ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-s bg-bg-secondary">
                        <Image
                            src={post.coverImageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                        />
                    </div>
                ) : null}

                <div className="flex-1">
                    <h3 className="line-clamp-1 text-sm font-semibold text-content-primary">
                        {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-content-tertiary">{post.excerpt}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-s bg-bg-secondary px-2 py-1 text-xs text-content-secondary">
                        <Clock className="size-3.5" />
                        {formatDate(post.publishedAt, locale)}
                    </span>

                    {canEdit && onEdit ? (
                        <Button size="sm" leadingIcon={<Pencil />} onClick={() => onEdit(post)}>
                            {t.common.edit}
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
