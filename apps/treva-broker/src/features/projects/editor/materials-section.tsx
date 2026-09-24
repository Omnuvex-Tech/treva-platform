"use client";

import { RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLayoutEffect, useRef, useState } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { ProjectMaterial } from "../types";
import { SectionHeader } from "./section-header";

const DOWNLOAD_MASK = `url("/images/news/detail/download.svg") center / 100% 100% no-repeat`;

/** The picker's filter; a dropped file is held to the same list. */
const ACCEPT = ".jpg,.jpeg,.png,.pdf,.mp4";
const ACCEPTED = /\.(jpe?g|png|pdf|mp4)$/i;

/** Figma's rhythm on the dropzone edge: 6 on, 6 off. */
const DASH_PERIOD = 12;

/**
 * The dropzone's dashed edge (382:13475), drawn as an SVG because a CSS dashed
 * border picks its own, much shorter, rhythm.
 *
 * A fixed "6 6" pattern almost never divides the rectangle's perimeter, so the
 * last partial dash ran into the first one where the path starts — a doubled
 * dash at the top-left corner. The pattern is stretched a fraction instead, so
 * a whole number of 12px periods goes round and the edge closes on a gap.
 */
function DashedEdge() {
    const rectRef = useRef<SVGRectElement>(null);
    const [dash, setDash] = useState(DASH_PERIOD / 2);

    useLayoutEffect(() => {
        const rect = rectRef.current;
        if (!rect) return;

        const fit = () => {
            const length = rect.getTotalLength();
            if (!length) return;
            const periods = Math.max(1, Math.round(length / DASH_PERIOD));
            setDash(length / periods / 2);
        };

        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(rect.ownerSVGElement ?? rect);
        return () => observer.disconnect();
    }, []);

    return (
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <rect
                ref={rectRef}
                x="0.5"
                y="0.5"
                rx="15.5"
                fill="none"
                stroke="var(--color-border-primary)"
                strokeDasharray={`${dash} ${dash}`}
                style={{ width: "calc(100% - 1px)", height: "calc(100% - 1px)" }}
            />
        </svg>
    );
}

/**
 * `Huge-icon/arrows/solid/download 01`: an 11.67x14.33 glyph sitting
 * off-centre in its 16px box — the same file and insets Broker Role's row uses.
 * The artboard's own export of this instance comes back as a stale chevron.
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
 * One 23px action cell (873:51347): the 16px glyph 12 from the top of the row.
 * 39 tall, not 40 — the cell's 1px rule is below it, and a 40px button pushed
 * every row to 41.
 */
const ACTION_CLASS =
    "flex h-[39px] items-start justify-center pt-3 text-content-tertiary transition-colors hover:text-content-primary disabled:opacity-50";

export interface MaterialsSectionProps {
    materials: readonly ProjectMaterial[];
    onDelete: (material: ProjectMaterial) => void;
    onAdd: (files: File[]) => void;
    /** Swaps a row's file for a newly picked one, keeping the row. */
    onReplace: (material: ProjectMaterial, file: File) => void;
    /** Called as a row's file is downloaded, alongside the download itself. */
    onDownload: (material: ProjectMaterial) => void;
    disabled?: boolean;
}

function pickFiles(multiple: boolean, onPick: (files: File[]) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = ACCEPT;
    input.onchange = () => {
        const files = Array.from(input.files ?? []);
        if (files.length) onPick(files);
    };
    input.click();
}

/**
 * Marketing Materials (873:51306).
 *
 * A five-column table — File, Category, Language, Size and a 69px action
 * column of three 23px cells — inside a white card on the XXL (12) radius
 * whose 20px inset is measured from the outer edge, with the dropzone below.
 *
 * The dropzone is not `FileDrop`: this one carries an "or" rule and a filled
 * Select file button under the hint, which that component has no slot for.
 */
export function MaterialsSection({
    materials,
    onDelete,
    onAdd,
    onReplace,
    onDownload,
    disabled,
}: MaterialsSectionProps) {
    const { locale, t } = useI18n();
    const [dragging, setDragging] = useState(false);

    function pick() {
        pickFiles(true, onAdd);
    }

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                title={t.projects.editor.materials}
                description={t.projects.editor.materialsHint}
            />

            <div className="px-2">
                <Card className="rounded-md p-[19px]">
                    <Table className="table-fixed">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>{t.projects.editor.columns.file}</TableHeaderCell>
                                <TableHeaderCell>
                                    {t.projects.editor.columns.category}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t.projects.editor.columns.language}
                                </TableHeaderCell>
                                <TableHeaderCell>{t.projects.editor.columns.size}</TableHeaderCell>
                                {/* Left aligned like every other header: the
                                    label starts 12 into the 69px column. */}
                                <TableHeaderCell className="w-[69px]">
                                    {t.projects.editor.columns.actions}
                                </TableHeaderCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {materials.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className="truncate">{material.name}</TableCell>

                                    <TableCell>
                                        <Badge
                                            tone="neutral"
                                            size="field"
                                            className="text-content-tertiary"
                                        >
                                            {t.brokerRole.categories[
                                                material.category as keyof typeof t.brokerRole.categories
                                            ] ?? material.category}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="truncate">
                                        {t.brokerRole.languages[
                                            material.language as keyof typeof t.brokerRole.languages
                                        ] ?? material.language}
                                    </TableCell>

                                    <TableCell className="truncate">
                                        {formatBytes(material.sizeBytes, locale)}
                                    </TableCell>

                                    {/* 873:51346 — three 23px cells, each glyph
                                        centred in its own. */}
                                    <TableCell className="px-0">
                                        <div className="grid grid-cols-3">
                                            {/* Downloads the stored file and
                                                counts it, like the detail screen. */}
                                            {material.url ? (
                                                <a
                                                    href={material.url}
                                                    download={material.name}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => onDownload(material)}
                                                    aria-label={t.brokerRole.download}
                                                    title={t.brokerRole.download}
                                                    className={ACTION_CLASS}
                                                >
                                                    <DownloadGlyph />
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    aria-label={t.brokerRole.download}
                                                    title={t.brokerRole.download}
                                                    className={ACTION_CLASS}
                                                >
                                                    <DownloadGlyph />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() =>
                                                    pickFiles(false, ([file]) => {
                                                        if (file) onReplace(material, file);
                                                    })
                                                }
                                                aria-label={t.projects.editor.replace}
                                                title={t.projects.editor.replace}
                                                className={ACTION_CLASS}
                                            >
                                                {/* No usable export for this
                                                    glyph; 1.5 in a 24 drawing
                                                    renders the row's 1px stroke. */}
                                                <HugeiconsIcon
                                                    icon={RefreshIcon}
                                                    size={16}
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => onDelete(material)}
                                                aria-label={t.common.delete}
                                                title={t.common.delete}
                                                className={`${ACTION_CLASS} hover:text-content-negative`}
                                            >
                                                <AssetIcon
                                                    src="/images/projects/icon-trash-thin.svg"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* 873:51365 / 382:13475 — a dashed Border/Primary edge on a 16px
                radius with no fill, padded 24. 12 between the icon and the
                instructions; inside those, 5 between the two lines, then 8 to
                the "or" rule and 8 more to the button — 197 tall in all. */}
            <div className="px-2">
                <div
                    onDragOver={(event) => {
                        if (disabled) return;
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        if (disabled) return;

                        const files = Array.from(event.dataTransfer.files).filter((file) =>
                            ACCEPTED.test(file.name),
                        );
                        if (files.length) onAdd(files);
                    }}
                    className={cn(
                        "relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-colors",
                        dragging && "bg-bg-secondary",
                    )}
                >
                    <DashedEdge />
                    <AssetIcon
                        src="/images/projects/icon-folder-upload.svg"
                        size={24}
                        className="text-content-primary"
                    />

                    <div className="flex w-full flex-col items-center gap-2">
                        <div className="flex w-full flex-col items-center gap-[5px] text-center">
                            <p className="text-base font-semibold text-content-primary">
                                {t.projects.editor.dropTitle}
                            </p>
                            <p className="text-sm text-content-tertiary">
                                {t.projects.editor.dropHint}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="flex w-[201px] items-center gap-3">
                                <span className="h-px flex-1 bg-border-subtle" />
                                <span className="text-sm text-content-tertiary">
                                    {t.projects.editor.or}
                                </span>
                                <span className="h-px flex-1 bg-border-subtle" />
                            </div>

                            {/* 382:13521 — 32 tall on the XXL radius, label 14/Regular. */}
                            <Button
                                type="button"
                                size="sm"
                                disabled={disabled}
                                onClick={pick}
                                className="h-8 shrink-0 rounded-md px-4 text-sm font-normal"
                            >
                                {t.projects.editor.selectFile}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
