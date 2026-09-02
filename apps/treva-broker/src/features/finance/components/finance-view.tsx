"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatManat, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { useFinanceSummary, useLeaderboard, useSales } from "../hooks/use-finance";
import type { SaleRow } from "../types";
import { SaleRequestModal } from "./sale-request-modal";

/** Both tables draw eight rows before they scroll (1173:18088). */
const SKELETON_ROWS = 8;

/**
 * Finance (artboard 1173:17952).
 *
 * Four blocks stacked flush — the artboard puts no gaps between them, and the
 * breathing room is each block's own padding, which is why the KPI row carries
 * `pt-2 pb-4` and the cards carry 24. Every block is inset 8px inside the
 * content area's 16, the same double inset Broker Role uses.
 *
 * The artboard hides its tab strip and both Pagination instances
 * (1173:18082 / 1173:18162 / 1173:18215). They are drawn but switched off, so
 * neither is rendered here; the previous build's status tabs, search box and
 * pager went with them.
 */
export function FinanceView() {
    const { locale, t } = useI18n();

    const toast = useToast();
    const summaryQuery = useFinanceSummary();
    const salesQuery = useSales();
    const leaderboardQuery = useLeaderboard();

    /**
     * The sale the request modal (1173:18646) is open against.
     *
     * The artboard draws no control that opens it — the sales table has no
     * action column and no Add button — so the row itself is the trigger. The
     * project name is a real button so the row is reachable by keyboard as
     * well; nothing about the cell changes visually.
     */
    const [requestSale, setRequestSale] = useState<SaleRow | null>(null);

    const summary = summaryQuery.data;
    const money = (value: number) => formatManat(value, locale);

    return (
        <div className="flex flex-col px-4 pt-4 pb-6">
            {/* ── KPI row (1173:17969) ─────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 px-2 pt-2 pb-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryQuery.isPending || !summary ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-34 rounded-md" />
                    ))
                ) : (
                    <>
                        <StatTile
                            label={t.finance.kpi.commission}
                            value={money(summary.totalCommission)}
                            trend={summary.commissionDelta >= 0 ? "up" : "down"}
                            note={interpolate(t.finance.kpi.vsLastMonth, {
                                value: `${formatNumber(Math.abs(summary.commissionDelta), locale)}%`,
                            })}
                        />
                        <StatTile
                            label={t.finance.kpi.deals}
                            value={formatNumber(summary.dealsClosed, locale)}
                            trend={summary.dealsClosedDelta >= 0 ? "up" : "down"}
                            note={interpolate(t.finance.kpi.vsLastMonth, {
                                value: `${summary.dealsClosedDelta >= 0 ? "+" : "−"}${formatNumber(
                                    Math.abs(summary.dealsClosedDelta),
                                    locale,
                                )}`,
                            })}
                        />
                        <StatTile
                            label={t.finance.kpi.volume}
                            value={money(summary.salesVolume)}
                            trend={summary.salesVolumeDelta >= 0 ? "up" : "down"}
                            note={interpolate(t.finance.kpi.vsLastMonth, {
                                value: `${formatNumber(Math.abs(summary.salesVolumeDelta), locale)}%`,
                            })}
                        />
                        {/* No arrow and no ink: a standing is not a movement. */}
                        <StatTile
                            label={t.finance.kpi.rank}
                            value={`#${formatNumber(summary.rank, locale)}`}
                            note={interpolate(t.finance.kpi.topPercent, {
                                percent: formatNumber(summary.rankPercentile, locale),
                            })}
                        />
                    </>
                )}
            </div>

            {/* ── Charts (1173:17995) ──────────────────────────────────── */}
            <div className="flex flex-col gap-6 px-2 xl:flex-row">
                <Card className="flex min-w-0 flex-1 flex-col gap-6 rounded-md p-6">
                    <div className="flex items-center gap-8">
                        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-content-primary">
                            {t.finance.trendTitle}
                        </h2>
                        <p className="shrink-0 text-sm whitespace-nowrap text-content-brand">
                            {t.finance.trendSubtitle}
                        </p>
                    </div>

                    {summaryQuery.isPending || !summary ? (
                        <Skeleton className="h-57 w-full" />
                    ) : (
                        <LineChart
                            points={summary.trend}
                            caption={t.finance.trendTitle}
                            format={money}
                        />
                    )}
                </Card>

                {/* 348px in the artboard, beside the 740px trend card. */}
                <Card className="flex shrink-0 flex-col gap-6 rounded-md p-6 xl:w-87">
                    <h2 className="truncate text-base font-semibold text-content-primary">
                        {t.finance.revenueTitle}
                    </h2>

                    {summaryQuery.isPending || !summary ? (
                        <Skeleton className="h-48 w-full" />
                    ) : (
                        <BarChart
                            data={summary.revenueByProject}
                            caption={t.finance.revenueTitle}
                            format={money}
                        />
                    )}
                </Card>
            </div>

            {/* ── Sales (1173:18081) ─────────────────────────────────────
                Flush against the charts above it: the artboard puts this block
                at y=496, which is exactly where the 320px chart row ends. */}
            <div className="px-2">
                <Card className="rounded-md p-5">
                    {salesQuery.isPending ? (
                        <TableRowsSkeleton columns={9} />
                    ) : salesQuery.isError ? (
                        <TableError onRetry={() => void salesQuery.refetch()} />
                    ) : salesQuery.data && salesQuery.data.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="w-9">
                                        {t.finance.columns.index}
                                    </TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.project}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.unit}</TableHeaderCell>
                                    <TableHeaderCell>
                                        {t.finance.columns.listingPrice}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {t.finance.columns.salesPrice}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {t.finance.columns.receivable}
                                    </TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.paid}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.remaining}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.salesDate}</TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {salesQuery.data.map((sale, index) => (
                                    <TableRow
                                        key={sale.id}
                                        interactive
                                        onClick={() => setRequestSale(sale)}
                                    >
                                        <TableCell className="text-content-tertiary">
                                            {formatNumber(index + 1, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <button
                                                type="button"
                                                className="cursor-pointer text-left"
                                                onClick={(event) => {
                                                    // The row handles it; this
                                                    // exists so a keyboard can
                                                    // reach the same action.
                                                    event.stopPropagation();
                                                    setRequestSale(sale);
                                                }}
                                            >
                                                {sale.projectName}
                                            </button>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {sale.unit}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {money(sale.listingPrice)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {money(sale.salesPrice)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {money(sale.receivable)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {money(sale.paid)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {money(sale.remaining)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-tertiary">
                                            {formatDate(sale.salesDate, locale)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={<HugeiconsIcon icon={ChartLineData01Icon} />}
                            title={t.common.empty}
                            description={t.common.emptyHint}
                        />
                    )}
                </Card>
            </div>

            {/* ── All Broker Leaderboard (1173:18163) ──────────────────── */}
            <div className="flex h-15 items-center px-2">
                <h2 className="truncate text-base font-medium text-content-primary">
                    {t.finance.leaderboard}
                </h2>
            </div>

            <div className="px-2">
                <Card className="rounded-md p-5">
                    {leaderboardQuery.isPending ? (
                        <TableRowsSkeleton columns={4} />
                    ) : leaderboardQuery.isError ? (
                        <TableError onRetry={() => void leaderboardQuery.refetch()} />
                    ) : leaderboardQuery.data && leaderboardQuery.data.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="w-9">
                                        {t.finance.columns.index}
                                    </TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.name}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.deals}</TableHeaderCell>
                                    <TableHeaderCell>
                                        {t.finance.columns.commission}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {leaderboardQuery.data.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="text-content-tertiary">
                                            {formatNumber(index + 1, locale)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {row.name}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {formatNumber(row.deals, locale)}
                                        </TableCell>
                                        <TableCell>
                                            {/* The arrow is a glyph, not an icon,
                                                so the direction survives the
                                                colour being unavailable. */}
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums",
                                                    row.trend === "up"
                                                        ? "text-content-positive-bold"
                                                        : "text-content-negative",
                                                )}
                                            >
                                                {money(row.commission)}
                                                <span aria-hidden>
                                                    {row.trend === "up" ? "↗" : "↘"}
                                                </span>
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={<HugeiconsIcon icon={ChartLineData01Icon} />}
                            title={t.common.empty}
                            description={t.common.emptyHint}
                        />
                    )}
                </Card>
            </div>

            <SaleRequestModal
                open={requestSale !== null}
                onClose={() => setRequestSale(null)}
                sale={requestSale}
                onSubmit={() => toast.success(t.finance.request.sentToast)}
            />
        </div>
    );
}

/** The 34px header row over eight 40px rows, while the real ones load. */
function TableRowsSkeleton({ columns }: { columns: number }) {
    return (
        <div className="flex flex-col">
            <div className="flex h-[34px] items-center gap-4">
                {Array.from({ length: columns }, (_, index) => (
                    <Skeleton key={index} className="h-3 flex-1" />
                ))}
            </div>
            {Array.from({ length: SKELETON_ROWS }, (_, row) => (
                <div
                    key={row}
                    className="flex h-10 items-center gap-4 border-b border-border-subtle"
                >
                    {Array.from({ length: columns }, (_, index) => (
                        <Skeleton key={index} className="h-3 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

function TableError({ onRetry }: { onRetry: () => void }) {
    const { t } = useI18n();

    return (
        <EmptyState
            icon={<HugeiconsIcon icon={ChartLineData01Icon} />}
            title={t.common.error}
            action={
                <Button variant="outline" onClick={onRetry}>
                    {t.common.retry}
                </Button>
            }
        />
    );
}
