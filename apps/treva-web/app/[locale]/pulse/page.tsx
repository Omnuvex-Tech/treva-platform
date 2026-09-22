import { notFound } from "next/navigation";
import Pulse from "@/app/components/Pulse/pulse";
import PageJsonLd from "@/app/components/PageJsonLd";
import { staticPageMetadata } from "@/lib/seo-fallbacks";
import { config } from "@/config";
import {
    getArticles,
    getHeaderArticles,
    getPulseCategories,
    apiArticleToArticle,
    getLocalized,
    type ApiArticle,
} from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export const generateMetadata = staticPageMetadata("pulse");

export default async function PulseRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    // allSettled, not all: the six requests are independent, so one slow or
    // failed call (usually the heavy article list) must not blank the whole
    // page — every block that did load is still shown.
    const [allResult, left, center, right, week, cats] = await Promise.allSettled([
        getArticles({ limit: 50, summary: true }),
        getHeaderArticles("left"),
        getHeaderArticles("center"),
        getHeaderArticles("right"),
        getHeaderArticles("week"),
        getPulseCategories(),
    ]);

    const toArticles = (result: PromiseSettledResult<ApiArticle[]>): Article[] =>
        result.status === "fulfilled" ? result.value.map((a) => apiArticleToArticle(a, locale)) : [];

    const articles: Article[] =
        allResult.status === "fulfilled" ? allResult.value.data.map((a) => apiArticleToArticle(a, locale)) : [];
    const leftArticles = toArticles(left);
    const centerArticle: Article | null = toArticles(center)[0] ?? null;
    const rightArticles = toArticles(right);
    const weekArticles = toArticles(week);
    const categories =
        cats.status === "fulfilled"
            ? cats.value.map((c) => ({ id: c.id, name: getLocalized(c.name, locale), slug: c.slug }))
            : [];


    return (
        <>
        <PageJsonLd pageKey="pulse" locale={locale} />
        <Pulse
            locale={locale}
            articles={articles}
            leftArticles={leftArticles}
            centerArticle={centerArticle}
            rightArticles={rightArticles}
            weekArticles={weekArticles}
            categories={categories}
        />
        </>
    );
}
