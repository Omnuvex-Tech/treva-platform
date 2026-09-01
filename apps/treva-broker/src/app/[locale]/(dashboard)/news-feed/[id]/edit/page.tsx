import { notFound } from "next/navigation";

import { NewsEditorView } from "@/features/news/editor/news-editor-view";
import { newsService } from "@/features/news/api/news.service";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function EditArticlePage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "news:update");

    try {
        const post = await newsService.detail(id);
        return <NewsEditorView post={post} />;
    } catch (error) {
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
