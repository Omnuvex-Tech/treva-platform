import type { Metadata } from "next";

import { ClientsView } from "@/features/clients/components/clients-view";
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

    return { title: t.clients.title };
}

export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "clients:read");

    return <ClientsView />;
}
