"use client";

import { Badge } from "@/components/ui/badge";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { BitrixSyncState, Client, DealStageSemantics } from "../types";

const SYNC_TONE: Record<BitrixSyncState, "positive" | "notice" | "negative"> = {
    synced: "positive",
    pending: "notice",
    failed: "negative",
};

const STAGE_TONE: Record<DealStageSemantics, "info" | "positive" | "negative"> = {
    P: "info",
    S: "positive",
    F: "negative",
};

export interface ClientDealPanelProps {
    client: Client;
}

/**
 * The "Sales Opportunities" tab: where the client stands in Bitrix24.
 *
 * On registration the API checks Bitrix for the client's phone and email. New
 * client: a contact and a deal in "Сделки от агентов" are created, and the deal
 * — with the stage it has reached — shows here. Known client: no deal, and the
 * panel says so. An admin also sees why a check failed; a broker only that it
 * has not happened yet.
 */
export function ClientDealPanel({ client }: ClientDealPanelProps) {
    const { locale, t } = useI18n();
    const { bitrix } = client;
    const deal = bitrix.deal;

    const stageLabel = deal
        ? {
              P: t.clients.deal.inProgress,
              S: t.clients.deal.won,
              F: t.clients.deal.lost,
          }[deal.stageSemantics]
        : null;

    return (
        <div className="flex flex-col gap-4 px-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-content-secondary">
                <Badge tone={SYNC_TONE[bitrix.syncState]} size="field">
                    {t.clients.bitrix[bitrix.syncState]}
                </Badge>

                {bitrix.contactId !== null ? (
                    <span>{interpolate(t.clients.bitrix.contact, { id: String(bitrix.contactId) })}</span>
                ) : null}

                {bitrix.syncedAt ? <span>· {formatRelativeTime(bitrix.syncedAt, locale)}</span> : null}
            </div>

            {bitrix.syncError ? <p className="text-xs text-content-negative">{bitrix.syncError}</p> : null}

            {deal ? (
                <div className="flex w-[730px] max-w-full flex-col gap-3 rounded-lg border border-border-subtle bg-bg-secondary p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-content-primary">
                            {interpolate(t.clients.deal.title, { id: String(deal.id) })}
                            {deal.title ? ` · ${deal.title}` : ""}
                        </p>
                        {stageLabel ? (
                            <Badge tone={STAGE_TONE[deal.stageSemantics]} size="field" className="shrink-0">
                                {stageLabel}
                            </Badge>
                        ) : null}
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                            <dt className="text-content-secondary">{t.clients.deal.stage}</dt>
                            <dd className="font-medium text-content-primary">{deal.stage || "—"}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="text-content-secondary">{t.clients.deal.amount}</dt>
                            <dd className="font-medium text-content-primary">
                                {deal.amount
                                    ? formatCurrency(deal.amount, locale, deal.currency ?? "AZN")
                                    : "—"}
                            </dd>
                        </div>
                    </dl>
                </div>
            ) : (
                <p className="text-xs text-content-secondary">
                    {client.status === "already_in_bitrix" ? t.clients.deal.alreadyInBitrix : t.clients.deal.none}
                </p>
            )}
        </div>
    );
}
