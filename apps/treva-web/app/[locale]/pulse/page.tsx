import { notFound } from "next/navigation";
import Pulse from "@/app/components/Pulse/pulse";
import { config } from "@/config";
import {
    getArticles,
    getHeaderArticles,
    getPulseCategories,
    apiArticleToArticle,
    getLocalized,
} from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function PulseRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    let articles: Article[] = [];
    let leftArticles: Article[] = [];
    let centerArticle: Article | null = null;
    let rightArticles: Article[] = [];
    let weekArticles: Article[] = [];
    let categories: { id: string; name: string; slug: string }[] = [];

    try {
        const [allResult, left, center, right, week, cats] = await Promise.all([
            getArticles({ limit: 50 }),
            getHeaderArticles("left"),
            getHeaderArticles("center"),
            getHeaderArticles("right"),
            getHeaderArticles("week"),
            getPulseCategories(),
        ]);
        articles = allResult.data.map(a => apiArticleToArticle(a, locale));
        leftArticles = left.map(a => apiArticleToArticle(a, locale));
        centerArticle = center[0] ? apiArticleToArticle(center[0], locale) : null;
        rightArticles = right.map(a => apiArticleToArticle(a, locale));
        weekArticles = week.map(a => apiArticleToArticle(a, locale));
        categories = cats.map((c) => ({ id: c.id, name: getLocalized(c.name, locale), slug: c.slug }));
    } catch {
        articles = [];
    }
    

    return (
        <Pulse
            locale={locale}
            articles={articles}
            leftArticles={leftArticles}
            centerArticle={centerArticle}
            rightArticles={rightArticles}
            weekArticles={weekArticles}
            categories={categories}
        />
    );
}
