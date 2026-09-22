import { notFound } from "next/navigation";
import HomeV2 from "@/app/components/HomeV2";
import PageJsonLd from "@/app/components/PageJsonLd";
import { staticPageMetadata } from "@/lib/seo-fallbacks";
import { config } from "@/config";
import {
    getArticles,
    apiArticleToArticle,
    toAbsUrl,
} from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";
import { getHomeInventory, getHomeResale } from "@/app/components/HomeV2/inventory-api";
import type { InventoryCard, NewsCard } from "@/app/components/HomeV2/data";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export const generateMetadata = staticPageMetadata("home");

/**
 * Home — the V2 redesign, now served straight from `/`. The old V1 home
 * (`components/Home`) is still in the tree but no route points at it anymore;
 * the `?v=2` switch that used to gate this is gone.
 */
export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
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
        const result = await getArticles({ limit: 4, summary: true });
        pulseArticles = result.data.map(a => apiArticleToArticle(a, locale));
    } catch {
        pulseArticles = [];
    }

    // Off-plan and resale are separate models/endpoints (unit-layouts vs
    // apartments) — fetched in parallel so the strip's two tabs show real,
    // distinct listings instead of the same off-plan units regardless of
    // which one is selected.
    let inventory: InventoryCard[] | undefined;
    let resaleInventory: InventoryCard[] | undefined;
    const [liveInventory, liveResale] = await Promise.all([
        getHomeInventory(6),
        getHomeResale(6),
    ]);
    if (liveInventory.length > 0) {
        inventory = liveInventory;
    }
    if (liveResale.length > 0) {
        resaleInventory = liveResale;
    }

    const news: NewsCard[] = pulseArticles.slice(0, 3).map((article, index) => ({
        id: article.id || article.slug || `news-${index}`,
        slug: article.slug,
        title: article.title,
        date: article.date,
        category: article.category,
        // apiArticleToArticle hands back the CMS's raw, relative path — toAbsUrl
        // is what the V1 home page's own Pulse section calls before rendering the
        // same field. Without it every cover 404s against treva-web's own origin
        // instead of the CMS's.
        image: toAbsUrl(article.coverImage || article.image || ""),
    }));

    return (
        <>
            <PageJsonLd pageKey="home" locale={locale} />
            <HomeV2
                locale={locale}
                inventory={inventory}
                resaleInventory={resaleInventory}
                news={news}
            />
        </>
    );
}
