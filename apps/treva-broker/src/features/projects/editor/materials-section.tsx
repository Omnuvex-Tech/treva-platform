"use client";

import { Delete02Icon, Download01Icon, FolderUploadIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import { formatBytes } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { ProjectMaterial } from "../types";
import { SectionHeader } from "./section-header";

export interface MaterialsSectionProps {
    materials: readonly ProjectMaterial[];
    onDelete: (material: ProjectMaterial) => void;
    onAdd: (files: File[]) => void;
    disabled?: boolean;
}

/**
 * Marketing Materials (873:51306).
 *
 * A five-column table — File, Category, Language, Size and a 69px action
 * column of three 23px icon buttons — inside the same 20px-padded card the
 * other tables in the app use, with the dropzone below it.
 *
 * The dropzone is not `FileDrop`: this one carries an "or" rule and a filled
 * Select file button under the hint, which that component has no slot for.
 */
export function MaterialsSection({
    materials,
    onDelete,
    onAdd,
    disabled,
}: MaterialsSectionProps) {
    const { locale, t } = useI18n();

    function pick() {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".jpg,.jpeg,.png,.pdf,.mp4";
        input.onchange = () => {
            const files = Array.from(input.files ?? []);
            if (files.length) onAdd(files);
        };
        input.click();
    }

    return (
        <section className="flex flex-col gap-3">
            <SectionHeader
                title={t.projects.editor.materials}
                description={t.projects.editor.materialsHint}
            />

            <div className="px-2">
                <Card className="p-5">
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
                                <TableHeaderCell className="w-[69px] text-right">
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
                                            className="px-2 py-1 text-xs font-medium tracking-normal normal-case"
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

                                    {/* 873:51346 — three 23px buttons, right aligned. */}
                                    <TableCell className="px-0">
                                        <div className="flex items-center justify-end gap-0.5 text-content-tertiary">
                                            <button
                                                type="button"
                                                aria-label={t.brokerRole.download}
                                                title={t.brokerRole.download}
                                                className="flex size-6 items-center justify-center rounded-xxs transition-colors hover:bg-bg-secondary hover:text-content-primary"
                                            >
                                                <HugeiconsIcon
                                                    icon={Download01Icon}
                                                    size={16}
                                                    strokeWidth={1.6}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label={t.projects.editor.replace}
                                                title={t.projects.editor.replace}
                                                className="flex size-6 items-center justify-center rounded-xxs transition-colors hover:bg-bg-secondary hover:text-content-primary"
                                            >
                                                <HugeiconsIcon
                                                    icon={RefreshIcon}
                                                    size={16}
                                                    strokeWidth={1.6}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => onDelete(material)}
                                                aria-label={t.common.delete}
                                                title={t.common.delete}
                                                className="flex size-6 items-center justify-center rounded-xxs transition-colors hover:bg-bg-secondary hover:text-content-negative disabled:opacity-50"
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete02Icon}
                                                    size={16}
                                                    strokeWidth={1.6}
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

            {/* 873:51365 / 382:13475 — dashed Border/Primary on a 16px radius,
                padded 24 with 12 between the icon and the instructions, and an
                "or" rule above the button. `FileDrop` has no slot for that
                second half, which is why this one is written out here. */}
            <div className="px-2">
                <div className="flex h-[197px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-primary bg-bg-primary p-6">
                    <HugeiconsIcon
                        icon={FolderUploadIcon}
                        size={24}
                        strokeWidth={1.6}
                        className="text-content-primary"
                    />

                    <div className="flex flex-col items-center gap-[5px] text-center">
                        <p className="text-base font-semibold text-content-primary">
                            {t.projects.editor.dropTitle}
                        </p>
                        <p className="text-sm text-content-tertiary">
                            {t.projects.editor.dropHint}
                        </p>
                    </div>

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
        </section>
    );
}
