"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import { AssetIcon } from "@/components/ui/asset-icon";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { NewsPost } from "../types";

export interface NewsCardProps {
    post: NewsPost;
    onEdit?: (post: NewsPost) => void;
    onCopy?: (post: NewsPost) => void;
    onDelete?: (post: NewsPost) => void;
}

/**
 * A card in the News Feed grid. The artboard (873:49160) draws two, and this
 * component renders both:
 *
 *  - `UnitCard` (916:12102) for a post with no image: 12px radius, 13px
 *    padding, a 4px accent bar under the top edge, then a 32px header row
 *    (badge + copy/delete chips), a flush 1px divider 16px below it, the title
 *    and excerpt 16px further down, and the footer 24px under those.
 *  - `Ui Card` (916:11929) for a post with one: 20px radius, 8px padding (12
 *    at the bottom), a 200px image on the same radius with the header row laid
 *    over it 8px in, then the text block and footer inset another 4px.
 *
 * Figma strokes sit inside the frame while a CSS border does not, so every
 * padding below is the artboard's minus the 1px border.
 *
 * `coverImageUrl` is what picks between them — `null` means the post has no
 * image area at all, `""` means the area exists but no asset has been uploaded.
 *
 * Either way the Edit, Copy and delete affordances are gated on `news:update`,
 * `news:create` and `news:delete`, which is the only difference between the
 * Broker and the Admin/Top Broker artboards.
 */
export function NewsCard({ post, onEdit, onCopy, onDelete }: NewsCardProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canEdit = can("news:update");
    const canCopy = can("news:create");
    const canDelete = can("news:delete");
    const announcement = post.category === "announcement";
    const hasImageArea = post.coverImageUrl !== null;
    const href = routes.newsDetail(locale, post.id);

    const header = (
        <div className="flex w-full items-center justify-between">
            <CategoryBadge announcement={announcement}>
                {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
            </CategoryBadge>

            <div className="pointer-events-auto flex items-center gap-1">
                {canCopy && onCopy ? (
                    // `Sale` (916:12110): a 32px Background/Teritary chip on the 4XL radius.
                    <button
                        type="button"
                        aria-label={`${t.news.copy}: ${post.title}`}
                        onClick={() => onCopy(post)}
                        className="flex h-8 items-center justify-center rounded-xl bg-bg-tertiary px-2 py-1 text-content-tertiary transition-colors hover:text-content-primary"
                    >
                        <AssetIcon src="/images/news/icon-copy.svg" size={16} />
                    </button>
                ) : null}

                {canDelete && onDelete ? (
                    <button
                        type="button"
                        aria-label={`${t.common.delete}: ${post.title}`}
                        onClick={() => onDelete(post)}
                        className="flex h-8 items-center justify-center rounded-xl bg-bg-tertiary px-2 py-1 text-content-tertiary transition-colors hover:text-content-negative"
                    >
                        <AssetIcon src="/images/news/icon-trash.svg" size={16} />
                    </button>
                ) : null}
            </div>
        </div>
    );

    const footer = (
        <div className="flex w-full items-center justify-between">
            {/* `Price` (916:12118): stretched to the row, so it matches the 28px Edit chip. */}
            <span className="flex items-center gap-1 self-stretch rounded-lg bg-bg-tertiary px-2 py-1 text-sm font-semibold whitespace-nowrap text-black">
                <AssetIcon src="/images/news/icon-clock.svg" size={16} className="text-content-brand" />
                {formatDate(post.publishedAt, locale)}
            </span>

            {canEdit && onEdit ? (
                <button
                    type="button"
                    onClick={() => onEdit(post)}
                    className="flex h-7 items-center justify-center gap-2 rounded-lg bg-bg-brand px-2 py-1 text-sm font-medium whitespace-nowrap text-content-inverse transition-colors hover:bg-content-brand-bold"
                >
                    <AssetIcon src="/images/news/icon-pencil.svg" size={16} />
                    {t.common.edit}
                </button>
            ) : null}
        </div>
    );

    if (hasImageArea) {
        return (
            <article className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-primary px-[7px] pt-[7px] pb-[11px]">
                <div className="relative">
                    <div className="relative h-50 w-full overflow-hidden rounded-xl bg-bg-secondary">
                        {/* The cover is a link in its own right — the title is not
                            the only way into the article. It stays a separate
                            anchor rather than wrapping the whole tile, because the
                            delete control lives on top of it and an anchor cannot
                            contain a button. */}
                        <Link href={href} aria-label={post.title} className="absolute inset-0">
                            {post.coverImageUrl ? (
                                <Image
                                    src={post.coverImageUrl}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 263px"
                                    className="object-cover"
                                />
                            ) : null}
                        </Link>
                    </div>

                    {/* Laid over the image, 8px in. The row ignores clicks so the
                        cover behind it stays reachable; the chip takes them back. */}
                    <div className="pointer-events-none absolute top-2 right-[7px] left-2">
                        {header}
                    </div>
                </div>

                <div className="flex flex-col gap-6 px-1">
                    <CardText post={post} href={href} />
                    {footer}
                </div>
            </article>
        );
    }

    return (
        <article className="relative flex flex-col overflow-clip rounded-md border border-border-subtle bg-bg-primary p-3">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="w-[calc(100%-5px)]">{header}</div>
                    <span aria-hidden className="block h-px w-full rounded-pill bg-border-subtle" />
                    <CardText post={post} href={href} />
                </div>
                {footer}
            </div>

            {/* 916:12122 — 4px tall, set 1px under the top edge (so 3px shows)
                and inset 7px left / 5px right of the border. */}
            <span
                aria-hidden
                className={cn(
                    "absolute -top-px right-[5px] left-[7px] h-1",
                    announcement ? "bg-border-notice" : "bg-content-positive",
                )}
            />
        </article>
    );
}

/**
 * The `Badge` pill (916:12109): 8px by 4px on the pill radius, 12/Medium.
 * News is Positive on Positive Subtle; announcements are Notice on Notice
 * Subtle and set in capitals, as the artboard writes them.
 */
function CategoryBadge({ announcement, children }: { announcement: boolean; children: ReactNode }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-pill px-2 py-1 text-xs font-medium whitespace-nowrap",
                announcement
                    ? "bg-bg-notice-subtle text-content-notice uppercase"
                    : "bg-bg-positive-subtle text-content-positive",
            )}
        >
            {children}
        </span>
    );
}

/**
 * The `Apartment Info` block both variants share: a 16/Semibold title on one
 * line over a 14/Medium, Content/Brand excerpt clipped to two.
 *
 * The title is the link into the article. A link rather than a click handler on
 * the whole card: the card already carries Edit and delete controls, and
 * nesting those inside a clickable region makes both the markup and the hit
 * targets ambiguous.
 */
function CardText({ post, href }: { post: NewsPost; href: string }) {
    return (
        <div className="flex w-full flex-col gap-3">
            <Link
                href={href}
                className="truncate text-base font-semibold text-content-primary hover:underline"
            >
                {post.title}
            </Link>
            <p className="line-clamp-2 h-10 text-sm font-medium text-content-brand">{post.excerpt}</p>
        </div>
    );
}
