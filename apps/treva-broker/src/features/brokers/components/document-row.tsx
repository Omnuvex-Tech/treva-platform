"use client";

import { FileText } from "lucide-react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatBytes, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { BrokerDocument } from "../types";

/**
 * The chips' glyphs, exported from the artboard rather than taken from
 * @hugeicons/core-free-icons: the pack the design draws from differs from the
 * npm line — the trash lid is bowed, not straight — and a 16px box carries a
 * 1.5px stroke where the npm icon, being a 24px drawing scaled down, renders 1.
 * News drew the same three first, so these are its files.
 */
const ICONS = "/images/news";

const DOWNLOAD_MASK = `url("${ICONS}/detail/download.svg") center / 100% 100% no-repeat`;

/**
 * `Huge-icon/arrows/solid/download 01` (I873:49494;9137:7763): an 11.67x14.33
 * glyph sitting off-centre in its 16px box, so it cannot go through the square
 * AssetIcon. Same mask technique, same insets as the news article's own
 * download button.
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

export interface DocumentRowProps {
    document: BrokerDocument;
    onDownload: (document: BrokerDocument) => void;
    /** Opens the file's own screen (873:52019). */
    onEdit?: (document: BrokerDocument) => void;
    onDelete: (document: BrokerDocument) => void;
}

/**
 * One 60px row of the materials list (873:49478).
 *
 * Three columns with 12px between them: a 30x30 tile holding a 15px glyph, the
 * name over the size, and the download count followed by the action chips. The
 * two text lines are 18 tall each, which is what centres them in a 60px row.
 *
 * The glyph is lucide's `FileText` rather than a Hugeicon, and that is not a
 * leftover: the artboard's own export IS that icon, scaled to 15px. Its five
 * paths match lucide `file-text` multiplied by 15/24 to the digit —
 * `M15 2H6…` exports as `M9.375 1.25H3.75`. Swapping it for a Hugeicon would
 * be the change of design, not the fix.
 *
 * Kind is deliberately NOT mapped to different glyphs any more, matching the
 * artboard: it draws the same sheet against a .pdf and a .pptx alike, and the
 * extension is already the last thing in every name.
 */
export function DocumentRow({ document, onDownload, onEdit, onDelete }: DocumentRowProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canManage = can("brokers:update");

    return (
        <div className="flex h-15 items-center gap-3 px-4">
            {/* 30x30 on Background/Secondary with an 8px radius (873:49479). */}
            <span className="flex size-7.5 shrink-0 items-center justify-center rounded-sm bg-bg-secondary text-content-tertiary">
                <FileText className="size-3.75" />
            </span>

            {/* 12/Semibold over 12/Regular (873:49487). The artboard shows the
                size on its own — no version suffix beside it. */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-content-primary">
                    {document.name}
                </p>
                <p className="text-xs text-content-tertiary">
                    {formatBytes(document.sizeBytes, locale)}
                </p>
            </div>

            {/* 873:49491 — the count, then the chips. The artboard sets these
                gaps to 11.25, which is 12 carrying the row's own scaling; the
                token is the honest value. */}
            <div className="flex shrink-0 items-center gap-3">
                {/* Supplementary, and the first thing worth dropping when the
                    row runs out of width. */}
                <span className="hidden text-xs text-content-tertiary md:block">
                    {interpolate(t.brokerRole.downloads, {
                        count: formatNumber(document.downloads, locale),
                    })}
                </span>

                <Button
                    variant="brandOutline"
                    size="chip"
                    className="px-[7px]"
                    leadingIcon={<DownloadGlyph />}
                    onClick={() => onDownload(document)}
                >
                    {t.brokerRole.download}
                </Button>

                {canManage ? (
                    <Button
                        variant="brandOutline"
                        size="chip"
                        className="px-[7px]"
                        leadingIcon={<AssetIcon src={`${ICONS}/icon-pencil.svg`} size={16} />}
                        onClick={() => onEdit?.(document)}
                    >
                        {t.common.edit}
                    </Button>
                ) : null}

                {canManage ? (
                    <Button
                        variant="dangerOutline"
                        size="chip"
                        className="px-[7px]"
                        leadingIcon={<AssetIcon src={`${ICONS}/icon-trash.svg`} size={16} />}
                        onClick={() => onDelete(document)}
                    >
                        {t.common.delete}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
