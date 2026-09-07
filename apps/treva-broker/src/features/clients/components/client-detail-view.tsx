"use client";

import { Delete02Icon, PinIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Tabs } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { useConfirm } from "@/hooks/use-confirm";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteClients } from "../hooks/use-clients";
import type { Client, ClientStatus } from "../types";

const STATUS_TONE: Record<ClientStatus, "positive" | "notice" | "negative"> = {
    approved: "positive",
    pending: "notice",
    rejected: "negative",
};

type TabValue = "salesOpportunities" | "history";

export interface ClientDetailViewProps {
    client: Client;
}

/**
 * One of the four cells in the summary row (873:49425).
 *
 * 273 x 46 on a Background/Disabled fill with a subtle border, content inset
 * 13px on a single 18px line. The artboard gives each cell ONE text node
 * ("Emial: ajdarkalbiyev@gmail.com"), so label and value share both the line
 * and the type style — the label is not a dimmer caption above the value.
 */
function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex h-[46px] min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary px-[13px]">
            <span className="truncate text-xs font-medium text-content-primary">
                {label}: {children}
            </span>
        </div>
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
 * Block sizes come straight off the artboard — a 60px header whose content is
 * inset 24px with a 94x44 action, a row of four 273x46 cells 12px apart and
 * flush with the 1128 content column, a 730x70 pinned note inset 8px, and a
 * 44px tab row with 8px under it.
 *
 * Nothing is drawn below the tabs: 873:49450 is a bare Tab panel and the
 * artboard ends there, so the panel body is left to the screens that will fill
 * it rather than invented here.
 */
export function ClientDetailView({ client }: ClientDetailViewProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();
    const router = useRouter();

    const [tab, setTab] = useState<TabValue>("salesOpportunities");

    const deleteClients = useDeleteClients();
    const confirmDelete = useConfirm<Client>();

    const tabs = [
        { value: "salesOpportunities" as const, label: t.clients.tabs.salesOpportunities },
        { value: "history" as const, label: t.clients.tabs.history },
    ];

    const fullName = `${client.firstName} ${client.lastName}`;

    function performDelete() {
        deleteClients.mutate([client.id], {
            // The record this screen is about is gone, so there is nothing left
            // to show — go back to the list rather than render a 404.
            onSuccess: () => router.push(routes.clients(locale)),
            onSettled: confirmDelete.dismiss,
        });
    }

    return (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
            {/* 873:49419 — a plain 60px row, not a card: the headline frame has
                a 12px radius but no fill, so the title sits on the page. */}
            <div className="flex h-15 items-center justify-between gap-4 px-6">
                <h2 className="truncate text-base font-medium text-content-primary">{fullName}</h2>

                {can("clients:delete") ? (
                    <Button
                        variant="dangerOutline"
                        size="lg"
                        // 94x44 with a 3XL radius — the shared `lg` size rounds
                        // to 12px, this button is 16.
                        className="shrink-0 rounded-lg px-3.5"
                        leadingIcon={
                            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                        }
                        onClick={() => confirmDelete.ask(client)}
                        loading={deleteClients.isPending}
                    >
                        {t.common.delete}
                    </Button>
                ) : null}
            </div>

            {/* 873:49424 — 4 x 273 with 12px gutters is exactly the 1128 column. */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Field label={t.clients.detail.email}>{client.email}</Field>
                <Field label={t.clients.detail.phone}>{client.phone}</Field>

                <div className="flex h-[46px] min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary px-[13px]">
                    <span className="shrink-0 text-xs font-medium text-content-primary">
                        {t.clients.detail.approvalStatus}:
                    </span>
                    <Badge
                        tone={STATUS_TONE[client.status]}
                        // 873:49434 is a 20px pill of 12/Medium sentence case,
                        // not the 10px uppercase pill the news cards use.
                        className="h-5 px-1 text-xs font-medium tracking-normal normal-case"
                    >
                        {t.clients.status[client.status]}
                    </Badge>
                </div>

                <Field label={t.clients.detail.agent}>{client.brokerName}</Field>
            </div>

            {/* 873:49438 — 730 wide inside an 8px inset, on Background/Teritary
                with no border. It stops well short of the column, which is why
                it cannot be a band of a full-width card. */}
            <div className="px-2">
                <div className="flex w-[730px] max-w-full gap-2 rounded-lg bg-bg-tertiary p-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-bg-secondary text-content-secondary">
                        <HugeiconsIcon icon={PinIcon} size={14} strokeWidth={1.6} />
                    </span>

                    <div className="flex min-w-0 flex-col gap-2 text-content-secondary">
                        <p className="text-sm font-medium">{t.clients.detail.reviewTitle}</p>
                        <p className="text-xs">{t.clients.detail.reviewBody}</p>
                    </div>
                </div>
            </div>

            {/* Not a card: 873:49447 is a "Header Container" wrapper and the
                only visible thing in it is the 224x44 Tab panel at x8, with
                8px of padding under it. */}
            <div className="px-2 pb-2">
                <Tabs variant="pill" items={tabs} value={tab} onChange={setTab} />
            </div>

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.clients.deleteConfirm}
                subject={fullName}
                confirmLabel={t.common.confirmDelete}
                loading={deleteClients.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
