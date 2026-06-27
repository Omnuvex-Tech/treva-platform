import { notFound } from "next/navigation";
import Pulse from "@/app/components/Pulse/pulse";
import { config } from "@/config";
import {
    getArticles,
    getHeaderArticles,
    getPulseCategories,
    apiArticleToArticle,
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
    let categories: { id: string; name: string }[] = [];

    try {
        const [allResult, left, center, right, week, cats] = await Promise.all([
            getArticles({ limit: 50 }),
            getHeaderArticles("left"),
            getHeaderArticles("center"),
            getHeaderArticles("right"),
            getHeaderArticles("week"),
            getPulseCategories(),
        ]);
        articles = allResult.data.map(apiArticleToArticle);
        leftArticles = left.map(apiArticleToArticle);
        centerArticle = center[0] ? apiArticleToArticle(center[0]) : null;
        rightArticles = right.map(apiArticleToArticle);
        weekArticles = week.map(apiArticleToArticle);
        categories = cats.map((c) => ({ id: c.id, name: c.name }));
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
