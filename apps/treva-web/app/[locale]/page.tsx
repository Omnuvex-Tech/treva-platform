import { notFound } from "next/navigation";
import Home from "@/app/components/Home";
import { config } from "@/config";
import { getArticles, apiArticleToArticle } from "@/lib/pulse-api";
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
    try {
        const result = await getArticles({ limit: 4 });
        pulseArticles = result.data.map(apiArticleToArticle);
    } catch {
        pulseArticles = [];
    }

    return (
        <Home locale={locale} pulseArticles={pulseArticles} />
    );
}
