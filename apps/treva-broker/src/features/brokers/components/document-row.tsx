"use client";

import { Download, FileSpreadsheet, FileText, Presentation, Share2, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatBytes, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { BrokerDocument, DocumentKind } from "../types";

const KIND_ICON: Record<DocumentKind, LucideIcon> = {
    pdf: FileText,
    docx: FileText,
    pptx: Presentation,
    xlsx: FileSpreadsheet,
    image: FileText,
    other: FileText,
};

export interface DocumentRowProps {
    document: BrokerDocument;
    onDownload: (document: BrokerDocument) => void;
    onDelete: (document: BrokerDocument) => void;
}

/**
 * One 60px row of the materials list: type icon, name over size, then the
 * download count and the three row actions from the artboard.
 */
export function DocumentRow({ document, onDownload, onDelete }: DocumentRowProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const Icon = KIND_ICON[document.kind];
    const canManage = can("brokers:update");

    return (
        <div className="flex h-15 items-center gap-3 px-4">
            <span className="flex size-7.5 shrink-0 items-center justify-center rounded-s bg-bg-secondary text-content-tertiary">
                <Icon className="size-3.75" />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-content-primary">{document.name}</p>
                <p className="text-xs text-content-tertiary">
                    {formatBytes(document.sizeBytes, locale)}
                    {" · "}
                    {interpolate(t.brokerRole.version, { version: document.version })}
                </p>
            </div>

            {/* Restricted files are called out so a broker is not surprised that
                a colleague cannot see what they just shared. */}
            {document.visibility !== "all" ? (
                <Badge tone="neutral" className="hidden lg:inline-flex">
                    {document.visibility === "admin"
                        ? t.brokerRole.visibilityAdmin
                        : t.brokerRole.visibilityTop}
                </Badge>
            ) : null}

            <span className="hidden w-28 shrink-0 text-right text-xs text-content-tertiary md:block">
                {interpolate(t.brokerRole.downloads, {
                    count: formatNumber(document.downloads, locale),
                })}
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" leadingIcon={<Download />} onClick={() => onDownload(document)}>
                    {t.brokerRole.download}
                </Button>

                <Button variant="outline" size="sm" leadingIcon={<Share2 />}>
                    {t.brokerRole.share}
                </Button>

                {canManage ? (
                    <Button
                        variant="outline"
                        size="sm"
                        leadingIcon={<Trash2 />}
                        onClick={() => onDelete(document)}
                        className="text-content-tertiary hover:text-content-negative"
                    >
                        {t.brokerRole.remove}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
