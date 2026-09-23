import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { agenciesService } from "@/features/users/api/agencies.service";
import { AgencyFormView } from "@/features/users/components/agency-form-view";
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

    return { title: t.users.agencyForm.editTitle };
}

/** Real estate edit — the pencil on the Real Estate Agencies tab. */
export default async function AdminAgencyEditPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "admin:access", "users:update");

    try {
        const agency = await agenciesService.detail(id);
        return <AgencyFormView agency={agency} />;
    } catch (error) {
        // A missing agency is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
