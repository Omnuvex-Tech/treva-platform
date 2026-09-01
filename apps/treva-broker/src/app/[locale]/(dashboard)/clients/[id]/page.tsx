import { notFound } from "next/navigation";

import { clientsService } from "@/features/clients/api/clients.service";
import { ClientDetailView } from "@/features/clients/components/client-detail-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function ClientDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "clients:read");

    try {
        const client = await clientsService.detail(id);
        return <ClientDetailView client={client} />;
    } catch (error) {
        // A missing client is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
