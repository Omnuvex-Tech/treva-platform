"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatBytes, formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useMarkNewsRead } from "../hooks/use-news";
import { newsRichTextClass } from "../rich-text";
import type { AttachmentKind, NewsPost } from "../types";

export interface NewsDetailViewProps {
    post: NewsPost;
}

const ICONS = "/images/news/detail";

/**
 * The row glyph per file: the artboard draws a document for the PDF row and a
 * box for the .zip one; everything that is not a document reads as the box.
 */
const ATTACHMENT_ICON: Record<AttachmentKind, { src: string; size: number }> = {
    pdf: { src: `${ICONS}/file.svg`, size: 15 },
    doc: { src: `${ICONS}/file.svg`, size: 15 },
    sheet: { src: `${ICONS}/file.svg`, size: 15 },
    image: { src: `${ICONS}/file.svg`, size: 15 },
    other: { src: `${ICONS}/archive.svg`, size: 16 },
};

const DOWNLOAD_MASK = `url("${ICONS}/download.svg") center / 100% 100% no-repeat`;

/**
 * `Huge-icon/arrows/solid/download 01`: an 11.67x14.33 glyph inset in its 16px
 * box, so it cannot go through the square AssetIcon. Same mask technique.
 */
function DownloadGlyph() {
    return (
        <span aria-hidden className="relative size-4 shrink-0">
            <span
                className="absolute inset-[1.04%_13.54%_9.37%_13.54%] bg-current"
                style={{ mask: DOWNLOAD_MASK, WebkitMask: DOWNLOAD_MASK }}
            />
        </span>
    );
}

/**
 * The read view of an article (artboard 873:51693).
 *
 * The page chrome matches the feed: Background/Secondary behind a 2px gutter,
 * a Background/Primary (50%) area with 16px padding, and the card 8px further
 * in. Navigation is the header breadcrumb (873:51699), so there is no in-page
 * back link or Edit button.
 *
 * The card (920:11706) fills the content area — 1108 wide is simply what is
 * left of the 1440 artboard, so it is not a cap — on a 12px radius. Its edge
 * is not a plain 1px line: the artboard nests a second bordered frame
 * (920:11707) 1px inside the first, one frame too wide, so the two Border/Subtle
 * lines read as 2px on the top, left and bottom while the clipped right edge
 * stays 1px (sampled off the export: #ebebeb at x 306–307, y 96–97 and
 * 948–949, but x 1413 alone). The column (920:11709) sits 18px in from the
 * top, left and bottom and 16px from the right, which is what the padding
 * here adds up to with those borders. In that column,
 * 20px apart: a 368px cover on the 24px radius; the title / date / body beside
 * the category badge, 12px apart; and Attachments — a 60px heading row over a
 * 660px list of 60px rows on the 16px radius.
 *
 * The body is HTML written by the editor, so it is rendered with
 * `dangerouslySetInnerHTML`. That is safe only because authoring is gated on
 * `news:create` / `news:update` — admins, not arbitrary users. If posts ever
 * accept untrusted input, this needs sanitising at the boundary.
 */
export function NewsDetailView({ post }: NewsDetailViewProps) {
    const { locale, t } = useI18n();
    const markRead = useMarkNewsRead();

    // Reading is what the reader does, not what the server does while building
    // the page — see NewsService.markRead in the API. The ref keeps Strict
    // Mode's second effect from sending a duplicate; the call is idempotent
    // either way, so a repeat would cost a request, not a wrong count.
    const readPostId = useRef<string | null>(null);
    const mark = markRead.mutate;

    useEffect(() => {
        if (readPostId.current === post.id) return;

        readPostId.current = post.id;
        mark(post.id);
    }, [mark, post.id]);

    const announcement = post.category === "announcement";

    return (
        <div className="flex min-h-full bg-bg-secondary px-0.5">
            <div className="flex min-w-0 flex-1 flex-col bg-bg-primary/50 p-4">
                <div className="px-2">
                    <article className="w-full overflow-clip rounded-md border-y-2 border-r border-l-2 border-border-subtle bg-bg-primary py-4 pr-[15px] pl-4">
                        <div className="flex flex-col gap-5">
                            {/* Same convention as the card: null means no image area at
                                all, "" means the area exists with no asset yet. */}
                            {post.coverImageUrl !== null ? (
                                <div className="relative h-[368px] w-full overflow-hidden rounded-[var(--radius-5xl)] bg-bg-secondary">
                                    {post.coverImageUrl ? (
                                        <Image
                                            src={post.coverImageUrl}
                                            alt=""
                                            fill
                                            sizes="1074px"
                                            unoptimized={post.coverImageUrl.startsWith("blob:")}
                                            className="object-cover"
                                            priority
                                        />
                                    ) : null}
                                </div>
                            ) : null}

                            {/* `Announcement` (920:11711): the 935px content column and
                                the category badge, 12px apart, top-aligned. */}
                            <div className="flex items-start gap-3">
                                <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                                    <h1 className="text-2xl font-semibold text-content-primary">{post.title}</h1>

                                    {/* Badge (920:11715): 20px pill on Background/Teritary. */}
                                    <span className="inline-flex h-5 items-center gap-1 rounded-pill bg-bg-tertiary px-1 text-xs font-medium whitespace-nowrap text-content-tertiary">
                                        <AssetIcon src={`${ICONS}/clock.svg`} size={16} />
                                        {formatDate(post.publishedAt, locale)}
                                    </span>

                                    {/* 920:11716 — 14/Regular on Content/Secondary, 16px
                                        between paragraphs. The excerpt is the card's own
                                        teaser (news-card.tsx) and does not repeat here. */}
                                    <div className="flex w-full flex-col gap-4 text-sm text-content-secondary">
                                        {post.body ? (
                                            <div
                                                className={newsRichTextClass}
                                                dangerouslySetInnerHTML={{ __html: post.body }}
                                            />
                                        ) : null}
                                    </div>
                                </div>

                                {/* Badge (920:11720): 12/Medium, 8 / 4 padding, upper case. */}
                                <Badge
                                    tone={announcement ? "notice" : "positive"}
                                    size="field"
                                    className="shrink-0 uppercase"
                                >
                                    {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
                                </Badge>
                            </div>

                            {post.attachments.length > 0 ? (
                                <section className="flex flex-col">
                                    {/* `headline` (920:11722): 60px tall, 8px padding. */}
                                    <h2 className="flex h-15 items-center p-2 text-base font-medium text-content-primary">
                                        {t.news.editor.attachments}
                                    </h2>

                                    <ul className="flex w-full max-w-165 flex-col overflow-clip rounded-lg border border-border-subtle bg-bg-primary">
                                        {post.attachments.map((attachment) => {
                                            const icon = ATTACHMENT_ICON[attachment.kind];

                                            return (
                                                <li
                                                    key={attachment.id}
                                                    className="flex h-15 items-center gap-3 border-b border-border-subtle px-4 last:border-b-0"
                                                >
                                                    <span className="flex size-7.5 shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-tertiary">
                                                        <AssetIcon src={icon.src} size={icon.size} />
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold text-content-primary">
                                                            {attachment.name}
                                                        </p>
                                                        <p className="text-xs text-content-tertiary">
                                                            {formatBytes(attachment.sizeBytes, locale)}
                                                        </p>
                                                    </div>

                                                    {/* Button (920:11739): the 28px brand chip. A link
                                                        when there is a stored file — served by the API
                                                        through the /uploads rewrite; fixtures carry
                                                        none, so they keep the inert button. */}
                                                    {attachment.url ? (
                                                        <a
                                                            href={attachment.url}
                                                            download={attachment.name}
                                                            className={cn(
                                                                buttonVariants({ variant: "brandOutline", size: "chip" }),
                                                                "shrink-0",
                                                            )}
                                                        >
                                                            <DownloadGlyph />
                                                            {t.brokerRole.download}
                                                        </a>
                                                    ) : (
                                                        <Button
                                                            variant="brandOutline"
                                                            size="chip"
                                                            className="shrink-0"
                                                            disabled
                                                            leadingIcon={<DownloadGlyph />}
                                                        >
                                                            {t.brokerRole.download}
                                                        </Button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            ) : null}
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
