"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
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
 * A card in the News Feed grid.
 *
 * The artboard uses two different cards, and this component renders both:
 *
 *  - `UnitCard` (263x215) for a post with no image: a 4px accent rail inset to
 *    249px, 13px padding, a 32px header row, a 1px divider flush under it, a
 *    72px title/excerpt block and a 28px footer.
 *  - `Ui Card` (263x356) for a post with one: 8px side / 16px vertical padding,
 *    a 247x200 image with the badge and the delete control laid OVER it, then
 *    the same 72px text block and 28px footer. No accent rail, no divider.
 *
 * `coverImageUrl` is what picks between them — `null` means the post has no
 * image area at all, `""` means the area exists but no asset has been uploaded.
 *
 * Either way the Edit and delete affordances are gated on `news:update` /
 * `news:delete`, which is the only difference between the Broker and the
 * Admin/Top Broker artboards.
 */
export function NewsCard({ post, onEdit, onDelete }: NewsCardProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canEdit = can("news:update");
    const canDelete = can("news:delete");
    const announcement = post.category === "announcement";
    const hasImageArea = post.coverImageUrl !== null;

    const badge = (
        <Badge tone={announcement ? "notice" : "positive"}>
            {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
        </Badge>
    );

    const deleteButton =
        canDelete && onDelete ? (
            <Button
                variant="ghost"
                size="iconSm"
                aria-label={`${t.common.delete}: ${post.title}`}
                onClick={() => onDelete(post)}
                className={cn(
                    "text-content-tertiary hover:text-content-negative",
                    hasImageArea && "bg-bg-primary/85 hover:bg-bg-primary",
                )}
            >
                <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
            </Button>
        ) : null;

    return (
        <article className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-primary">
            {hasImageArea ? null : (
                <span
                    aria-hidden
                    className={cn(
                        "mx-[7px] h-1 rounded-b-xs",
                        announcement ? "bg-content-notice" : "bg-content-positive",
                    )}
                />
            )}

            <div
                className={cn(
                    "flex flex-1 flex-col",
                    hasImageArea ? "gap-3 px-2 py-4" : "gap-6 p-[13px]",
                )}
            >
                {hasImageArea ? (
                    <div className="relative aspect-[247/200] w-full overflow-hidden rounded-sm bg-bg-secondary">
                        {post.coverImageUrl ? (
                            <Image
                                src={post.coverImageUrl}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 100vw, 263px"
                                className="object-cover"
                            />
                        ) : null}

                        {/* The badge and the delete control sit on the image. */}
                        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
                            {badge}
                            {deleteButton}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex h-8 items-center justify-between gap-2">
                            {badge}
                            {deleteButton}
                        </div>

                        {/* Flush under the header row; the whole gap sits below. */}
                        <span aria-hidden className="block h-px bg-border-subtle" />
                    </div>
                )}

                <CardText post={post} href={routes.newsDetail(locale, post.id)} />

                <div className="mt-auto flex h-7 items-center justify-between gap-2 px-[5px]">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-bg-secondary px-2 py-1 text-xs text-content-secondary">
                        <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={1.6} />
                        {formatDate(post.publishedAt, locale)}
                    </span>

                    {canEdit && onEdit ? (
                        <Button
                            size="sm"
                            leadingIcon={
                                <HugeiconsIcon icon={PencilEdit02Icon} size={14} strokeWidth={1.6} />
                            }
                            onClick={() => onEdit(post)}
                        >
                            {t.common.edit}
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

/**
 * The 72px block both card variants share: a 20px title over a 40px excerpt.
 *
 * The title is the link into the article. A link rather than a click handler on
 * the whole card: the card already carries Edit and delete controls, and
 * nesting those inside a clickable region makes both the markup and the hit
 * targets ambiguous.
 */
function CardText({ post, href }: { post: NewsPost; href: string }): ReactNode {
    return (
        <div className="flex h-18 flex-col gap-3 overflow-hidden px-[5px]">
            <Link
                href={href}
                className="line-clamp-1 text-sm font-semibold text-content-primary hover:underline"
            >
                {post.title}
            </Link>
            <p className="line-clamp-2 text-sm text-content-tertiary">{post.excerpt}</p>
        </div>
    );
}
