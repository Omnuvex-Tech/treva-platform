"use client";

import Image from "next/image";
import { Clock01Icon, Download04Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes, formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { NewsPost } from "../types";

export interface NewsDetailViewProps {
    post: NewsPost;
}

/**
 * The read view of an article (artboard 873:51693).
 *
 * Body content only: the artboard puts navigation in the header as a
 * breadcrumb (873:51699) and shows no in-page back link or Edit button, so
 * neither is rendered here.
 *
 * The whole article lives in ONE card 1124px wide with a 1074px inner column:
 * a 1074x368 cover, then a row of the title / date / body beside the category
 * badge, then an attachments section whose list is only 660px wide.
 *
 * The body is HTML written by the editor, so it is rendered with
 * `dangerouslySetInnerHTML`. That is safe only because authoring is gated on
 * `news:create` / `news:update` — admins, not arbitrary users. If posts ever
 * accept untrusted input, this needs sanitising at the boundary.
 */
export function NewsDetailView({ post }: NewsDetailViewProps) {
    const { locale, t } = useI18n();

    const announcement = post.category === "announcement";

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            {/* 1124 wide with 25px padding, giving the 1074 inner column. */}
            <Card className="w-full max-w-[1124px] p-[25px]">
                <article className="flex flex-col gap-6">
                    {/* Same convention as the card: null means no image area at
                        all, "" means the area exists with no asset yet. */}
                    {post.coverImageUrl !== null ? (
                        <div className="relative aspect-[1074/368] w-full overflow-hidden rounded-md bg-bg-secondary">
                            {post.coverImageUrl ? (
                                <Image
                                    src={post.coverImageUrl}
                                    alt=""
                                    fill
                                    sizes="1074px"
                                    unoptimized={post.coverImageUrl.startsWith("blob:")}
                                    className="object-cover"
                                />
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-6">
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            <h1 className="text-2xl leading-8 font-medium text-content-primary text-balance">
                                {post.title}
                            </h1>

                            <span className="inline-flex w-fit items-center gap-1.5 rounded-s bg-bg-secondary px-2 py-1 text-xs text-content-secondary">
                                <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={1.6} />
                                {formatDate(post.publishedAt, locale)}
                            </span>

                            {post.excerpt ? (
                                <p className="text-sm leading-5 text-content-secondary">
                                    {post.excerpt}
                                </p>
                            ) : null}

                            <div
                                className="text-sm leading-5 text-content-primary [&_a]:text-content-link [&_a]:underline [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                                dangerouslySetInnerHTML={{ __html: post.body }}
                            />
                        </div>

                        <Badge
                            tone={announcement ? "notice" : "positive"}
                            size="md"
                            className="shrink-0"
                        >
                            {announcement ? t.news.categoryAnnouncement : t.news.categoryNews}
                        </Badge>
                    </div>

                    {post.attachments.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-sm font-semibold text-content-primary">
                                {t.news.editor.attachments}
                            </h2>

                            {/* The list is 660 wide in the artboard, not full bleed. */}
                            <ul className="flex w-full max-w-165 flex-col divide-y divide-border-subtle rounded-md border border-border-subtle">
                                {post.attachments.map((attachment) => (
                                    <li
                                        key={attachment.id}
                                        className="flex h-15 items-center gap-3 px-3"
                                    >
                                        <span className="flex size-7.5 shrink-0 items-center justify-center rounded-s bg-bg-secondary text-content-tertiary">
                                            <HugeiconsIcon
                                                icon={File01Icon}
                                                size={15}
                                                strokeWidth={1.6}
                                            />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm text-content-primary">
                                                {attachment.name}
                                            </p>
                                            <p className="text-xs text-content-tertiary">
                                                {formatBytes(attachment.sizeBytes, locale)}
                                            </p>
                                        </div>

                                        <Button
                                            size="sm"
                                            className="w-26 shrink-0"
                                            leadingIcon={
                                                <HugeiconsIcon
                                                    icon={Download04Icon}
                                                    size={14}
                                                    strokeWidth={1.6}
                                                />
                                            }
                                        >
                                            {t.brokerRole.download}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </article>
            </Card>
        </div>
    );
}
