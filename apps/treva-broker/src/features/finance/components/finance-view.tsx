"use client";

import { Banknote, Handshake, Search, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

import { DonutChart } from "@/components/charts/donut-chart";
import { LineChart } from "@/components/charts/line-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCompact, formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useFinanceSummary, useTransactions } from "../hooks/use-finance";
import type { TransactionQuery, TransactionStatus } from "../types";

type StatusTab = NonNullable<TransactionQuery["status"]>;

const PER_PAGE = 8;

const STATUS_TONE: Record<TransactionStatus, "positive" | "info" | "notice" | "negative"> = {
    paid: "positive",
    processing: "info",
    pending: "notice",
    cancelled: "negative",
};

/**
 * Finance: a KPI row, two charts, then the transaction ledger.
 *
 * Scope, not layout, is what changes by role — a broker without
 * `finance:read_all` sees only their own commission, and the summary is derived
 * from the same rows the table shows so the two can never disagree.
 */
export function FinanceView() {
    const { locale, t } = useI18n();
    const { user, can } = useSession();

    const [status, setStatus] = useState<StatusTab>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 300);
    const seesEveryone = can("finance:read_all");
    const scopeId = seesEveryone ? undefined : user.id;

    const summaryQuery = useFinanceSummary(scopeId);
    const listQuery = useTransactions({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        status,
        brokerId: scopeId,
    });

    const tabs: TabItem<StatusTab>[] = [
        { value: "all", label: t.finance.tabs.all },
        { value: "paid", label: t.finance.tabs.paid },
        { value: "processing", label: t.finance.tabs.processing },
        { value: "pending", label: t.finance.tabs.pending },
        { value: "cancelled", label: t.finance.tabs.cancelled },
    ];

    const summary = summaryQuery.data;
    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryQuery.isPending || !summary ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-34 rounded-lg" />
                    ))
                ) : (
                    <>
                        <StatTile
                            label={t.finance.commission}
                            value={formatCurrency(summary.totalCommission, locale)}
                            delta={summary.commissionDelta}
                            hint={t.finance.vsPrev}
                            icon={<Wallet />}
                        />
                        <StatTile
                            label={t.finance.pendingPayout}
                            value={formatCurrency(summary.pendingPayout, locale)}
                            delta={summary.pendingDelta}
                            hint={t.finance.vsPrev}
                            icon={<Banknote />}
                        />
                        <StatTile
                            label={t.finance.closedDeals}
                            value={formatNumber(summary.closedDeals, locale)}
                            delta={summary.closedDealsDelta}
                            hint={t.finance.vsPrev}
                            icon={<Handshake />}
                        />
                        <StatTile
                            label={t.finance.avgDeal}
                            value={formatCurrency(summary.averageDealValue, locale)}
                            delta={summary.averageDealDelta}
                            hint={t.finance.vsPrev}
                            icon={<TrendingUp />}
                        />
                    </>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.finance.monthlyTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summaryQuery.isPending || !summary ? (
                            <Skeleton className="h-57 w-full" />
                        ) : (
                            <LineChart
                                points={summary.monthly}
                                caption={t.finance.monthlyTitle}
                                format={(value) => formatCompact(value, locale)}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.finance.splitTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summaryQuery.isPending || !summary ? (
                            <Skeleton className="h-43 w-full" />
                        ) : (
                            <DonutChart
                                slices={summary.byStatus}
                                centerLabel={t.finance.commission}
                                centerValue={formatCompact(summary.totalCommission, locale)}
                                format={(value) => formatCurrency(value, locale)}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Tabs
                    items={tabs}
                    value={status}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                />

                <Input
                    type="search"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                    placeholder={t.finance.searchPlaceholder}
                    aria-label={t.finance.searchPlaceholder}
                    leadingIcon={<Search />}
                    containerClassName="w-87"
                />
            </div>

            {listQuery.isPending ? (
                <TableSkeleton rows={PER_PAGE} columns={7} />
            ) : listQuery.isError ? (
                <EmptyState
                    icon={<Wallet />}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => listQuery.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : data && data.items.length > 0 ? (
                <>
                    <Card className="overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>{t.finance.columns.reference}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.client}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.project}</TableHeaderCell>
                                    {seesEveryone ? (
                                        <TableHeaderCell>{t.finance.columns.broker}</TableHeaderCell>
                                    ) : null}
                                    <TableHeaderCell className="text-right">
                                        {t.finance.columns.amount}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-right">
                                        {t.finance.columns.commission}
                                    </TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.status}</TableHeaderCell>
                                    <TableHeaderCell>{t.finance.columns.date}</TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {data.items.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.reference}</TableCell>
                                        <TableCell className="text-content-secondary">
                                            {entry.clientName}
                                        </TableCell>
                                        <TableCell className="text-content-secondary">
                                            {entry.projectName}
                                        </TableCell>
                                        {seesEveryone ? (
                                            <TableCell className="text-content-secondary">
                                                {entry.brokerName}
                                            </TableCell>
                                        ) : null}
                                        <TableCell className="text-right whitespace-nowrap tabular-nums">
                                            {formatCurrency(entry.amount, locale)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                                            {formatCurrency(entry.commission, locale)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge tone={STATUS_TONE[entry.status]}>
                                                {t.finance.status[entry.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-tertiary">
                                            {formatDate(entry.date, locale)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                        summary={interpolate(t.common.showing, { from, to, total: data.total })}
                    />
                </>
            ) : (
                <EmptyState icon={<Wallet />} title={t.common.empty} description={t.common.emptyHint} />
            )}
        </div>
    );
}
