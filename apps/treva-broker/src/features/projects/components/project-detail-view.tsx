"use client";

import {
    ArrowRight02Icon,
    Download04Icon,
    File02Icon,
    Image01Icon,
    PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
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
    formatDate,
    formatManat,
    formatNumber,
    formatRelativeTime,
} from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
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

/** The offer badge's tone (1173:16276 / 1173:16281). */
const OFFER_TONE: Record<ProjectOffer["tag"], "positive" | "notice" | "info"> = {
    new: "positive",
    limited: "notice",
    exclusive: "info",
};

export interface ProjectDetailViewProps {
    project: Project;
}

/**
 * A project's own screen (1173:16211) — the read side of the editor.
 *
 * Eight blocks down one 1128 column, each a 60px headline over its content and
 * everything inset 8 so it lines up with the headline's own padding, exactly as
 * Projects and the editor do. Nothing here is editable: the editor owns that,
 * and the pencil in the headline is the way across.
 *
 * Two blocks carry a "Page Link" chip out to the section that owns the whole
 * dataset — Finance and Floor Plan are extracts here, which is why neither
 * draws a pager.
 */
export function ProjectDetailView({ project }: ProjectDetailViewProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();
    const copy = t.projects.detail;

    const activeHighlights = project.highlights.filter((highlight) => highlight.enabled);
    const activeOffers = project.offers.filter((offer) => offer.enabled);
    const { available, reserved, sold } = project.availability;
    const total = available + reserved + sold;

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            {/* 1173:16224 — 60 tall, the name inset 8, with the way into the
                editor beside it. The artboard draws no action here; the pencil
                is ours, because the read screen is otherwise a dead end. */}
            <div className="flex h-15 items-center justify-between gap-3 px-2">
                <p className="truncate text-base font-medium text-content-primary">
                    {project.name}
                </p>

                {can("projects:update") ? (
                    <Link
                        href={routes.projectEdit(locale, project.id)}
                        className={cn(
                            buttonVariants({ variant: "brandOutline", size: "sm" }),
                            "h-8 shrink-0 rounded-lg px-2",
                        )}
                    >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.6} />
                        {copy.edit}
                    </Link>
                ) : null}
            </div>

            <div className="flex flex-col px-2">
                {/* 1173:16228 — a 368 hero over three 200 tiles, 24 apart. */}
                <Hero url={project.heroImageUrl} className="h-92" sizes="1108px" />

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[0, 1, 2].map((index) => (
                        <Hero
                            key={index}
                            url={project.galleryImageUrls[index] ?? null}
                            className="h-50"
                            sizes="355px"
                        />
                    ))}
                </div>

                {/* 1173:16235 — three across, two down, 12 apart horizontally
                    and 8 vertically. */}
                {activeHighlights.length > 0 ? (
                    <Section title={t.projects.editor.highlights}>
                        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                            {activeHighlights.map((highlight) => (
                                <div
                                    key={highlight.id}
                                    className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-primary p-[13px]"
                                >
                                    <span aria-hidden className="text-[17px] leading-[26px]">
                                        {KIND_EMOJI[highlight.kind]}
                                    </span>
                                    {/* The artboard writes the pair as one line
                                        — "Handover: Q4 2026" — where the editor
                                        keeps label and value on separate rows. */}
                                    <span className="truncate text-xs font-medium text-content-primary">
                                        {highlight.value
                                            ? `${highlight.label}: ${highlight.value}`
                                            : highlight.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* 1173:16274 — two 549 cards, 14 apart. */}
                {activeOffers.length > 0 ? (
                    <Section title={t.projects.editor.offers}>
                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                            {activeOffers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="flex flex-col items-start gap-2 rounded-lg border border-border-subtle bg-bg-primary p-[13px]"
                                >
                                    <Badge tone={OFFER_TONE[offer.tag]} size="sm">
                                        {t.projects.editor.offerTags[offer.tag]}
                                    </Badge>
                                    <p className="text-sm font-semibold text-content-primary">
                                        {offer.title}
                                    </p>
                                    <p className="text-xs text-content-tertiary">
                                        {offer.description}
                                    </p>
                                    {offer.expiresAt ? (
                                        <p className="text-xs text-content-tertiary">
                                            {t.projects.editor.expires}{" "}
                                            {formatDate(offer.expiresAt, locale)}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* 1173:16289 — one bordered card holding 60px rows, the last
                    without a rule. */}
                {project.materials.length > 0 ? (
                    <Section title={t.projects.editor.materials}>
                        <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-primary">
                            {project.materials.map((material, index) => (
                                <div
                                    key={material.id}
                                    className={cn(
                                        "flex h-15 items-center gap-3 px-4",
                                        index < project.materials.length - 1 &&
                                            "border-b border-border-subtle",
                                    )}
                                >
                                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-secondary">
                                        <HugeiconsIcon
                                            icon={File02Icon}
                                            size={15}
                                            strokeWidth={1.6}
                                        />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-content-primary">
                                            {material.name}
                                        </p>
                                        <p className="text-xs text-content-tertiary">
                                            {formatBytes(material.sizeBytes, locale)}
                                        </p>
                                    </div>

                                    <p className="hidden shrink-0 text-xs whitespace-nowrap text-content-tertiary sm:block">
                                        {interpolate(copy.downloads, {
                                            count: formatNumber(material.downloads, locale),
                                        })}
                                    </p>

                                    <button
                                        type="button"
                                        className={cn(
                                            buttonVariants({ variant: "brandOutline" }),
                                            "h-7 shrink-0 rounded-lg px-2 text-sm",
                                        )}
                                    >
                                        <HugeiconsIcon
                                            icon={Download04Icon}
                                            size={16}
                                            strokeWidth={1.6}
                                        />
                                        {copy.download}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* 1173:16358 — eight rows in a bordered card, no pager. */}
                <Section
                    title={copy.finance}
                    action={<PageLink href={routes.finance(locale)} label={copy.pageLink} />}
                >
                    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-primary p-5">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="w-9">
                                        {copy.financeColumns.index}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.projectName}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.unitCode}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.listingPrice}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.salesPrice}
                                    </TableHeaderCell>
                                    {/* 1173:16426 — one 172px column split into
                                        three headers over a single body cell. */}
                                    <TableHeaderCell>
                                        {copy.financeColumns.received}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.paid}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {copy.financeColumns.remaining}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
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
                                        <TableCell className="whitespace-nowrap">
                                            {row.unitCode}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatManat(row.listingPrice, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatManat(row.salesPrice, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatManat(row.received, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatManat(row.paid, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatManat(row.remaining, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {row.salesDate
                                                ? formatDate(row.salesDate, locale)
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Section>

                {/* 1173:16458 — the Layouts tiles, four across. */}
                {project.layouts.length > 0 ? (
                    <Section
                        title={copy.floorPlan}
                        action={<PageLink href={routes.floorPlan(locale)} label={copy.pageLink} />}
                    >
                        <LayoutsGrid layouts={project.layouts} />
                    </Section>
                ) : null}

                {/* 1173:16463 — three counts on a 140px card over an 8px bar
                    split by share, not into equal thirds as the artboard's
                    placeholder draws it. */}
                <Section
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
                >
                    <div className="rounded-lg border border-border-subtle bg-bg-primary p-6">
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
                                        className="bg-content-positive"
                                        style={{ width: `${(available / total) * 100}%` }}
                                    />
                                    <span
                                        className="bg-content-notice"
                                        style={{ width: `${(reserved / total) * 100}%` }}
                                    />
                                    <span
                                        className="bg-content-negative"
                                        style={{ width: `${(sold / total) * 100}%` }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

/** A 60px headline over its content, the pattern every block repeats. */
function Section({
    title,
    action,
    children,
}: {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col">
            <div className="flex h-15 items-center justify-between gap-2 px-2">
                <p className="truncate text-base font-medium text-content-primary">{title}</p>
                {action}
            </div>
            {children}
        </section>
    );
}

/** The 32px outlined chip out to the section that owns the data (1173:16367). */
function PageLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className={cn(
                buttonVariants({ variant: "brandOutline" }),
                "h-8 shrink-0 gap-1 rounded-lg px-2 text-sm",
            )}
        >
            {label}
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.6} />
        </Link>
    );
}

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
        <div className="w-61 text-center">
            <p className={cn("text-3xl leading-10 font-bold", className)}>
                {formatNumber(value, locale)}
            </p>
            <p className="pt-1 text-xs font-semibold text-content-tertiary">{label}</p>
        </div>
    );
}

/** A 20px-radius well that falls back to a glyph when there is no photograph. */
function Hero({
    url,
    className,
    sizes,
}: {
    url: string | null;
    className: string;
    sizes: string;
}) {
    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-lg bg-bg-secondary",
                className,
            )}
        >
            {url ? (
                <Image src={url} alt="" fill sizes={sizes} className="object-cover" />
            ) : (
                <span className="flex size-full items-center justify-center text-content-disabled">
                    <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                </span>
            )}
        </div>
    );
}
