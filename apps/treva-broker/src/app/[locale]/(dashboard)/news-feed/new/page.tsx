import type { Metadata } from "next";

import { NewsEditorView } from "@/features/news/editor/news-editor-view";
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

    return { title: t.news.editor.createTitle };
}

export default async function NewArticlePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "news:create");

    return <NewsEditorView post={null} />;
}
