import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { clientsService } from "@/features/clients/api/clients.service";
import { ClientEditView } from "@/features/clients/components/client-edit-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const t = await getDictionary(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE);

    return { title: t.clients.form.editTitle };
}

/** Editing a lead: the lead form (873:49378), filled in. */
export default async function ClientEditPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "clients:update");

    try {
        const client = await clientsService.detail(id);
        return <ClientEditView client={client} />;
    } catch (error) {
        // A missing client is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
