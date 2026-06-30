import { notFound } from "next/navigation";
import Home from "@/app/components/Home";
import { config } from "@/config";
import { getArticles, apiArticleToArticle, getPulseCategories, getLocalized } from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    const content = config.staticContent[locale as keyof typeof config.staticContent];

    if (!content) {
        notFound();
    }

    let pulseArticles: Article[] = [];
    let pulseCategories: { id: string; name: string; slug: string }[] = [];
    try {
        const result = await getArticles({ limit: 4 });
        pulseArticles = result.data.map(a => apiArticleToArticle(a, locale));
    } catch {
        pulseArticles = [];
    }
    try {
        const cats = await getPulseCategories();
        pulseCategories = cats.map(c => ({ id: c.id, name: getLocalized(c.name, locale), slug: c.slug }));
    } catch {
        pulseCategories = [];
    }

    return (
        <Home locale={locale} pulseArticles={pulseArticles} pulseCategories={pulseCategories} />
    );
}
