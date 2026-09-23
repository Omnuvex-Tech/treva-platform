"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { buttonVariants } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { LayoutsGrid } from "@/features/floor-plan/components/layouts-grid";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import {
    formatBytes,
    formatCompact,
    formatDate,
    formatManat,
    formatNumber,
    formatRelativeTime,
} from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { projectsService } from "../api/projects.service";
import type { HighlightKind, Project, ProjectOffer } from "../types";

/**
 * The emoji each highlight row carries (1173:16242…).
 *
 * The artboard sets these as text, not as exported glyphs — they are literal
 * emoji in the layer — so they are literal here too rather than swapped for the
 * icon components the *editor* uses for the same six rows.
 */
const KIND_EMOJI: Record<HighlightKind, string> = {
    handover: "🗓️",
    payment: "💳",
    view: "🌊",
    amenities: "🏊",
    transit: "🚇",
    mortgage: "🏠",
};

/**
 * The offer badge (1173:16276 / 1173:16281): 8 / 4 padding on a pill, the
 * label 12/Medium in upper case — the layer's own text, not tracked-out
 * small caps — on the plain status inks.
 */
const OFFER_BADGE: Record<ProjectOffer["tag"], string> = {
    new: "bg-bg-positive-subtle text-content-positive",
    limited: "bg-bg-notice-subtle text-content-notice",
    exclusive: "bg-bg-info-subtle text-content-link",
};

const DOWNLOAD_MASK = `url("/images/news/detail/download.svg") center / 100% 100% no-repeat`;

/** A 1px-edged white card; every block on this screen draws its body in one. */
const CARD = "border border-border-subtle bg-bg-primary";

export interface ProjectDetailViewProps {
    project: Project;
}

/**
 * A project's own screen (1173:16211) — the read side of the editor.
 *
 * One 1128 column of blocks 12 apart: the gallery, Key Highlights, Special
 * Offers, Marketing Materials, Finance, the Floor Plan headline and its cards
 * (two siblings, so 12 between them too), and Live Availability. The first
 * four blocks and Finance are inset 8 with a 60px headline whose own 8px
 * padding puts the title at 16; the Floor Plan and Live Availability blocks
 * sit flush in the column, so their titles land at 8. That is how the artboard
 * is built, and the title x positions differ accordingly.
 *
 * Nothing here is editable and the artboard draws no action in the headline —
 * the card's Edit button on the Projects grid is the way into the editor.
 */
export function ProjectDetailView({ project }: ProjectDetailViewProps) {
    const { locale, t } = useI18n();
    const copy = t.projects.detail;
    // The project arrives rendered on the server; a download moves its count
    // here rather than refetching the whole screen.
    const [downloads, setDownloads] = useState<Record<string, number>>({});

    function countDownload(materialId: string) {
        projectsService
            .registerMaterialDownload(project.id, materialId)
            .then((count) => setDownloads((current) => ({ ...current, [materialId]: count })))
            .catch(() => {});
    }

    const activeHighlights = project.highlights.filter((highlight) => highlight.enabled);
    /** Empty slots are not drawn here — see the note on the gallery below. */
    const gallery = project.galleryImageUrls.filter(Boolean);
    const activeOffers = project.offers.filter((offer) => offer.enabled);
    const { available, reserved, sold } = project.availability;
    const total = available + reserved + sold;

    return (
        <div className="flex flex-col px-4 pt-4 pb-3">
            {/* 1173:16224 — 60 tall, the name inset 8. 12 below it (y 88). */}
            <div className="mb-3 flex h-15 items-center px-2">
                <p className="truncate text-base font-medium text-content-primary">
                    {project.name}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {/* 1173:16228 — a 368 hero over three 200 tiles, 24 apart and
                    inset 8. The hero is 1108, not the tiles' 1112: its row has
                    the same 8px inset but the frame stops 4 short. This screen
                    only reads, so a slot with no picture is drawn as nothing at
                    all rather than as an empty well. */}
                {project.heroImageUrl || gallery.length > 0 ? (
                    <div className="flex flex-col gap-6 px-2">
                        {project.heroImageUrl ? (
                            <Photo
                                url={project.heroImageUrl}
                                className="h-92 w-[calc(100%-4px)]"
                                sizes="1108px"
                            />
                        ) : null}

                        {gallery.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                {gallery.map((url) => (
                                    <Photo key={url} url={url} className="h-50" sizes="355px" />
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {/* 1173:16235 — three across, two down, 12 apart horizontally
                    and 8 vertically; each card 53 tall with its 13px inset
                    measured from the outer edge. */}
                {activeHighlights.length > 0 ? (
                    <Block title={t.projects.editor.highlights}>
                        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                            {activeHighlights.map((highlight) => (
                                <div
                                    key={highlight.id}
                                    className={cn("flex items-center gap-2 rounded-lg p-3", CARD)}
                                >
                                    {/* The emoji's text frame is 27 tall
                                        (1173:16241), a hair over its 26.25
                                        line, which is what makes the card 53. */}
                                    {highlight.iconUrl ? (
                                        // Uploaded in the editor, often an SVG,
                                        // so not through next's Image. Kept in
                                        // the emoji's 27px frame so the card
                                        // stays 53 tall either way.
                                        <span className="flex h-[27px] shrink-0 items-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={highlight.iconUrl}
                                                alt=""
                                                className="size-5 object-contain"
                                            />
                                        </span>
                                    ) : (
                                        <span
                                            aria-hidden
                                            className="h-[27px] text-[16.875px] leading-[26.25px]"
                                        >
                                            {KIND_EMOJI[highlight.kind]}
                                        </span>
                                    )}
                                    {/* The artboard writes the pair as one line
                                        — "Handover: Q4 2026" — where the editor
                                        keeps label and value on separate rows.
                                        Either one alone stands on its own: a
                                        row with only a value reads as that
                                        value, not as a dangling colon. */}
                                    <span className="truncate text-xs font-medium text-content-primary">
                                        {[highlight.label, highlight.value]
                                            .map((part) => part.trim())
                                            .filter(Boolean)
                                            .join(": ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Block>
                ) : null}

                {/* 1173:16274 — two 549 cards, 14 apart. */}
                {activeOffers.length > 0 ? (
                    <Block title={t.projects.editor.offers}>
                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                            {activeOffers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className={cn(
                                        "flex flex-col items-start gap-2 rounded-lg p-3",
                                        CARD,
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "rounded-pill px-2 py-1 text-xs font-medium uppercase",
                                            OFFER_BADGE[offer.tag],
                                        )}
                                    >
                                        {t.projects.editor.offerTags[offer.tag]}
                                    </span>
                                    <p className="text-sm font-semibold text-content-primary">
                                        {offer.title}
                                    </p>
                                    <p className="text-xs text-content-tertiary">
                                        {offer.description}
                                    </p>
                                    {offer.expiresAt ? (
                                        <p className="text-xs text-content-tertiary">
                                            {interpolate(copy.expires, {
                                                date: formatDate(offer.expiresAt, locale),
                                            })}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </Block>
                ) : null}

                {/* 1173:16289 — one card of 60px rows on a 3XL radius. The last
                    row runs into the card's bottom edge (240 of rows in a 241
                    frame), so it is 59 here. */}
                {project.materials.length > 0 ? (
                    <Block title={t.projects.editor.materials}>
                        <div className={cn("overflow-hidden rounded-lg", CARD)}>
                            {project.materials.map((material, index) => {
                                const last = index === project.materials.length - 1;

                                return (
                                    <div
                                        key={material.id}
                                        className={cn(
                                            "flex items-center gap-3 px-4",
                                            last ? "h-[59px]" : "h-15 border-b border-border-subtle",
                                        )}
                                    >
                                        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-tertiary">
                                            <AssetIcon
                                                src="/images/news/detail/file.svg"
                                                size={15}
                                            />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="h-[18.75px] truncate text-xs font-semibold text-content-primary">
                                                {material.name}
                                            </p>
                                            <p className="text-xs text-content-tertiary">
                                                {formatBytes(material.sizeBytes, locale)}
                                            </p>
                                        </div>

                                        {/* 1173:16303 — 11.25 between the count
                                            and the 28px Download chip. */}
                                        <div className="flex shrink-0 items-center gap-[11.25px]">
                                            <p className="hidden text-xs whitespace-nowrap text-content-tertiary sm:block">
                                                {interpolate(copy.downloads, {
                                                    count: formatNumber(
                                                        downloads[material.id] ??
                                                            material.downloads,
                                                        locale,
                                                    ),
                                                })}
                                            </p>

                                            {/* A real link, so the browser
                                                downloads it; the count is sent
                                                alongside, not awaited first. */}
                                            <a
                                                href={material.url}
                                                download={material.name}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-disabled={!material.url}
                                                onClick={(event) => {
                                                    if (!material.url) {
                                                        event.preventDefault();
                                                        return;
                                                    }
                                                    countDownload(material.id);
                                                }}
                                                className={cn(
                                                    buttonVariants({ variant: "brandOutline" }),
                                                    "h-7 shrink-0 rounded-lg bg-transparent px-[7px] py-1 text-sm",
                                                    !material.url && "pointer-events-none opacity-50",
                                                )}
                                            >
                                                <DownloadGlyph />
                                                {copy.download}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Block>
                ) : null}

                {/* 1173:16358 — eight rows in a 12px-radius card padded 20 from
                    its outer edge, no pager. № is 36 wide and the other seven
                    columns share the rest; the sixth is one column whose header
                    splits into Receivable / Paid / Remaining (1173:16426). */}
                <Block
                    title={copy.finance}
                    action={<PageLink href={routes.finance(locale)} label={copy.pageLink} />}
                >
                    <div className={cn("overflow-hidden rounded-md p-[19px]", CARD)}>
                        <Table className="table-fixed">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="w-9">
                                        {copy.financeColumns.index}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="truncate">
                                        {copy.financeColumns.projectName}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="truncate">
                                        {copy.financeColumns.unitCode}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="truncate">
                                        {copy.financeColumns.listingPrice}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="truncate">
                                        {copy.financeColumns.salesPrice}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="px-0">
                                        <SplitCells
                                            header
                                            values={[
                                                copy.financeColumns.received,
                                                copy.financeColumns.paid,
                                                copy.financeColumns.remaining,
                                            ]}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell className="truncate">
                                        {copy.financeColumns.salesDate}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {project.financeRows.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="truncate">
                                            {row.projectName}
                                        </TableCell>
                                        <TableCell className="truncate">{row.unitCode}</TableCell>
                                        <TableCell className="truncate">
                                            {formatManat(row.listingPrice, locale)}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {formatManat(row.salesPrice, locale)}
                                        </TableCell>
                                        {/* The three amounts sit under their own
                                            header thirds. At 57px each only a
                                            compact figure fits; the full amount
                                            is on hover. */}
                                        <TableCell className="px-0">
                                            <SplitCells
                                                values={[row.received, row.paid, row.remaining].map(
                                                    (amount) => ({
                                                        text: formatCompact(amount, locale),
                                                        title: formatManat(amount, locale),
                                                    }),
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {row.salesDate ? formatDate(row.salesDate, locale) : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Block>

                {/* 1173:16449 / 1173:16458 — the headline and the cards are two
                    siblings in the column, flush rather than inset 8. */}
                {project.layouts.length > 0 ? (
                    <>
                        <Headline
                            title={copy.floorPlan}
                            action={
                                <PageLink
                                    href={routes.floorPlan(locale, project.id)}
                                    label={copy.pageLink}
                                />
                            }
                            className="w-[calc(100%-16px)]"
                        />
                        <div className="px-2">
                            <LayoutsGrid layouts={project.layouts} />
                        </div>
                    </>
                ) : null}

                {/* 1173:16463 — flush and 1120 wide. Three counts on a 140px
                    card over an 8px bar split by share, not into equal thirds
                    as the artboard's placeholder draws it. */}
                <section className="flex w-[calc(100%-8px)] flex-col">
                    <Headline
                        title={t.projects.editor.availability}
                        action={
                            <p className="shrink-0 text-xs text-content-tertiary">
                                {interpolate(copy.lastSynced, {
                                    when: formatRelativeTime(
                                        project.availability.lastSyncedAt,
                                        locale,
                                    ),
                                })}
                            </p>
                        }
                    />

                    <div className={cn("h-35 rounded-lg p-6", CARD)}>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Count
                                value={available}
                                label={t.projects.editor.buckets.available}
                                className="text-content-positive-bold"
                            />
                            <Count
                                value={reserved}
                                label={t.projects.editor.buckets.reserved}
                                className="text-[var(--color-content-notice-bold)]"
                            />
                            <Count
                                value={sold}
                                label={t.projects.editor.buckets.sold}
                                className="text-[var(--color-content-negative-bold)]"
                            />
                        </div>

                        <div className="mx-auto mt-6 flex h-2 max-w-193 overflow-hidden rounded-pill bg-bg-secondary">
                            {total > 0 ? (
                                <>
                                    <span
                                        className="rounded-pill bg-content-positive"
                                        style={{ width: `${(available / total) * 100}%` }}
                                    />
                                    <span
                                        className="bg-content-notice"
                                        style={{ width: `${(reserved / total) * 100}%` }}
                                    />
                                    <span
                                        className="rounded-pill bg-content-negative"
                                        style={{ width: `${(sold / total) * 100}%` }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

/** A 60px headline: 8 of padding round a 16/Medium title and an optional action. */
function Headline({
    title,
    action,
    className,
}: {
    title: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex h-15 items-center justify-between gap-2 p-2", className)}>
            <p className="truncate text-base font-medium text-content-primary">{title}</p>
            {action}
        </div>
    );
}

/** An inset-8 block: the headline straight over its body, no gap between. */
function Block({
    title,
    action,
    children,
}: {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col px-2">
            <Headline title={title} action={action} />
            {children}
        </section>
    );
}

/**
 * Three equal thirds inside one table cell, each with the table's own 12px
 * inset — the Receivable / Paid / Remaining header (1173:16426) and the
 * amounts under it.
 */
function SplitCells({
    values,
    header = false,
}: {
    values: readonly (string | { text: string; title: string })[];
    header?: boolean;
}) {
    return (
        <div className="grid h-full grid-cols-3">
            {values.map((value, index) => {
                const text = typeof value === "string" ? value : value.text;
                const title = typeof value === "string" ? value : value.title;

                return (
                    <span
                        key={index}
                        title={title}
                        className={cn(
                            "flex items-center truncate px-3",
                            header && "h-[34px] bg-bg-secondary",
                        )}
                    >
                        <span className="truncate">{text}</span>
                    </span>
                );
            })}
        </div>
    );
}

/**
 * The 32px outlined chip out to the section that owns the data (1173:16452):
 * 8 of padding from the outer edge, 4 between the label and the 16px arrow.
 */
function PageLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className={cn(
                buttonVariants({ variant: "brandOutline" }),
                "h-8 shrink-0 gap-1 rounded-lg bg-transparent p-[7px] text-sm",
            )}
        >
            {label}
            <AssetIcon src="/images/projects/icon-arrow-up-right.svg" size={16} />
        </Link>
    );
}

/** `Huge-icon/arrows/solid/download 01` — the glyph sits off-centre in its box. */
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

/** One 245x59.7 count: 32/Bold over a 12/Semibold label with 4 above it. */
function Count({
    value,
    label,
    className,
}: {
    value: number;
    label: string;
    className: string;
}) {
    const { locale } = useI18n();

    return (
        <div className="h-[59.71px] w-[245px] text-center">
            <p className={cn("text-3xl leading-10 font-bold", className)}>
                {formatNumber(value, locale)}
            </p>
            <p className="h-5 pt-1 text-xs font-semibold text-content-tertiary">{label}</p>
        </div>
    );
}

/** A 5XL (24) radius photograph on a Background/Secondary well. */
function Photo({ url, className, sizes }: { url: string; className: string; sizes: string }) {
    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-[var(--radius-5xl)] bg-bg-secondary",
                className,
            )}
        >
            {url.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
                <Image src={url} alt="" fill sizes={sizes} className="object-cover" />
            )}
        </div>
    );
}
