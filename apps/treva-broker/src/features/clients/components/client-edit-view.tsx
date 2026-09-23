"use client";

import { useRouter } from "next/navigation";

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
 */
export function ClientEditView({ client }: ClientEditViewProps) {
    const { locale } = useI18n();
    const router = useRouter();

    const backToList = () => router.push(routes.clients(locale));

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            <div className="px-2">
                <ClientForm client={client} onDone={backToList} onCancel={backToList} />
            </div>
        </div>
    );
}
