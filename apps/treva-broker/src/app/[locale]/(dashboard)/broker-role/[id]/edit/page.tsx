import { notFound } from "next/navigation";

import { documentsService } from "@/features/brokers/api/documents.service";
import { DocumentEditView } from "@/features/brokers/components/document-edit-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function DocumentEditPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    // Reading is the gate, not updating: the artboard shows the same screen to
    // a broker with the form disabled, so a read-only visit has to get through.
    await requirePermission(locale, "brokers:read");

    try {
        const document = await documentsService.detail(id);
        return <DocumentEditView document={document} />;
    } catch (error) {
        // A missing file is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
