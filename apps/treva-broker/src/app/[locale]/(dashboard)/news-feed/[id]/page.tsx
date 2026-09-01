import { notFound } from "next/navigation";

import { NewsDetailView } from "@/features/news/components/news-detail-view";
import { newsService } from "@/features/news/api/news.service";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function NewsDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "news:read");

    try {
        const post = await newsService.detail(id);
        return <NewsDetailView post={post} />;
    } catch (error) {
        // A missing article is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
