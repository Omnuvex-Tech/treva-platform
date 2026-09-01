"use client";

import { PencilEdit02Icon, PinIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { Client, ClientStatus } from "../types";

const STATUS_TONE: Record<ClientStatus, "positive" | "negative" | "notice" | "info" | "neutral"> = {
    lead: "info",
    active: "positive",
    negotiating: "notice",
    closed: "neutral",
    lost: "negative",
};

export interface ClientDetailViewProps {
    client: Client;
}

/**
 * One of the four cells in the summary row (873:49425).
 *
 * 273 x 46 with its content inset 13px on a single 18px line — the artboard
 * gives each cell one text node, so label and value share the line rather than
 * stacking.
 */
function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Card className="flex h-[46px] min-w-0 items-center gap-2 px-[13px]">
            <span className="shrink-0 text-xs leading-[18px] text-content-tertiary">{label}</span>
            <span className="truncate text-xs leading-[18px] text-content-primary">{children}</span>
        </Card>
    );
}

/**
 * A client's own screen (artboard 873:49403).
 *
 * Four separate blocks stacked 24px apart, NOT one card divided into bands:
 * 873:49416 holds four siblings at y0 / y84 / y154 / y248, and the third is
 * only 746 wide. A band inside a full-width card could not stop short like
 * that, which is what gives the structure away.
 *
 * Block sizes come straight off the artboard — a 60px header inset 24px with a
 * 94x44 action, a row of four 273x46 cells 12px apart, a 746x70 pinned note,
 * and a 52px tab bar whose panel sits 8px in and is 44 tall.
 *
 * The tabs have no content in the file — 873:49450 is a bare Tab panel — so the
 * panel below is left to the screens that will fill it rather than invented
 * here.
 */
export function ClientDetailView({ client }: ClientDetailViewProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const [tab, setTab] = useState("overview");

    const tabs = [
        { value: "overview", label: t.clients.tabs.overview },
        { value: "activity", label: t.clients.tabs.activity },
        { value: "deals", label: t.clients.tabs.deals },
    ];

    return (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
            <Card className="flex h-15 items-center justify-between gap-4 px-6">
                <h2 className="truncate text-sm font-semibold text-content-primary">
                    {client.firstName} {client.lastName}
                </h2>

                {can("clients:update") ? (
                    <Button
                        variant="outline"
                        size="lg"
                        className="shrink-0"
                        leadingIcon={
                            <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.6} />
                        }
                    >
                        {t.common.edit}
                    </Button>
                ) : null}
            </Card>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Field label={t.clients.form.email}>{client.email}</Field>
                <Field label={t.clients.form.phone}>{client.phone}</Field>

                <Card className="flex h-[46px] min-w-0 items-center gap-2 px-[13px]">
                    <span className="shrink-0 text-xs leading-[18px] text-content-tertiary">
                        {t.clients.approvalStatus}
                    </span>
                    <Badge tone={STATUS_TONE[client.status]}>
                        {t.clients.status[client.status]}
                    </Badge>
                </Card>

                <Field label={t.clients.agentName}>{client.brokerName}</Field>
            </div>

            <Card className="flex h-[70px] w-full max-w-[746px] gap-2 px-5 py-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-s bg-bg-secondary text-content-tertiary">
                    <HugeiconsIcon icon={PinIcon} size={14} strokeWidth={1.6} />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="truncate text-sm leading-5 font-medium text-content-primary">
                        {t.clients.interestedIn}
                    </p>
                    <p className="truncate text-xs leading-[18px] text-content-tertiary">
                        {client.interest} · {formatCurrency(client.budget, locale)} ·{" "}
                        {formatDate(client.createdAt, locale)}
                    </p>
                </div>
            </Card>

            {/* Not a card: 873:49447 is a "Header Container" wrapper and the
                only visible thing in it is the 224x44 Tab panel at x8. */}
            <div className="flex h-13 items-center px-2">
                <Tabs items={tabs} value={tab} onChange={setTab} className="h-11" />
            </div>
        </div>
    );
}
