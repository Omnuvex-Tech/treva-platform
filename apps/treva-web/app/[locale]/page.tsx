import { notFound } from "next/navigation";
import Home from "@/app/components/Home";
import HomeV2 from "@/app/components/HomeV2";
import { config } from "@/config";
import {
    getArticles,
    apiArticleToArticle,
    getPulseCategories,
    getAuthors,
    getLocalized,
    toAbsUrl,
} from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";
import { getHomeInventory, getHomeResale } from "@/app/components/HomeV2/inventory-api";
import type { InventoryCard, NewsCard, TeamMember } from "@/app/components/HomeV2/data";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

/** `?v=2` renders the redesign; anything else keeps the current (v1) home page. */
function resolveDesignVersion(value: string | string[] | undefined): "v1" | "v2" {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw === "2" || raw === "v2" ? "v2" : "v1";
}

export default async function HomePage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { locale } = await params;
    const { v } = await searchParams;
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

    if (resolveDesignVersion(v) === "v2") {
        // V2 needs two extra feeds the V1 home page never asked for. Both are
        // optional: the sections hide themselves (team, news) or fall back to
        // seed cards (inventory) when a service is unreachable.
        let team: TeamMember[] = [];
        try {
            const authors = await getAuthors(locale);
            team = authors.slice(0, 3).map((author) => ({
                id: author.id,
                name: author.name,
                role: author.title || "",
                avatar: toAbsUrl(author.avatar || "") || "",
                href: `/${locale}/authors/${author.slug}`,
            }));
        } catch {
            team = [];
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
            // apiArticleToArticle hands back the CMS's raw, relative path —
            // toAbsUrl (already used for the team avatars above) is what the
            // V1 home page's own Pulse section calls before rendering the
            // same field. Without it every cover 404s against treva-web's own
            // origin instead of the CMS's.
            image: toAbsUrl(article.coverImage || article.image || ""),
        }));

        return (
            <HomeV2
                locale={locale}
                inventory={inventory}
                resaleInventory={resaleInventory}
                team={team}
                news={news}
            />
        );
    }

    return (
        <Home locale={locale} pulseArticles={pulseArticles} pulseCategories={pulseCategories} />
    );
}
