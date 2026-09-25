"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import type { Client } from "../types";
import { ClientForm } from "./client-form";

export interface ClientEditViewProps {
    client: Client;
}

/**
 * The edit screen for a lead: the same form, in the same place, as registering
 * one (873:49378) — 16px in, then 8 more — just filled with this client. Saving
 * or cancelling returns to the list the row was opened from.
 *
 * Only while the client is still waiting for the Bitrix24 check: once a deal
 * has been created (or the client found in Bitrix), Bitrix owns the record and
 * the API refuses edits, so the form is replaced by a note saying so.
 */
export function ClientEditView({ client }: ClientEditViewProps) {
    const { locale, t } = useI18n();
    const router = useRouter();

    const backToList = () => router.push(routes.clients(locale));

    if (client.status !== "pending") {
        return (
            <div className="flex flex-col items-start gap-4 px-6 pt-6 pb-8">
                <p className="text-sm text-content-secondary">{t.clients.form.lockedReviewed}</p>
                <Button variant="brandOutline" onClick={() => router.push(routes.clientDetail(locale, client.id))}>
                    {t.clients.form.backToClient}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            <div className="px-2">
                <ClientForm client={client} onDone={backToList} onCancel={backToList} />
            </div>
        </div>
    );
}
