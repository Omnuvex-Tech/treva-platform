import { notFound } from "next/navigation";
import { config } from "@/config";
import ComparePage from "@/app/components/HomeV2/ComparePage";
import { getHomeInventory } from "@/app/components/HomeV2/inventory-api";
import type { InventoryCard } from "@/app/components/HomeV2/data";

export const revalidate = 60;

export async function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

/**
 * Comparison — Figma 638:26919.
 *
 * Unlike the home page there is no V1 of this screen to fall back to, so the
 * route renders the V2 design whatever `?v=` says. The parameter is still
 * accepted and ignored rather than rejected: links arriving from the V2 home
 * carry it, and 404-ing them would be pointless.
 *
 * Two units is what the design lays out. The list comes from the same
 * `/unit-layouts` feed the home strip uses, and falls back to the seed cards
 * when that service is unreachable, so the page always has something to show.
 */
export default async function ComparisonPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!config.project.staticLanguages.some((language) => language.code === locale)) {
        notFound();
    }

    let items: InventoryCard[] | undefined;
    const live = await getHomeInventory(2);
    if (live.length > 0) {
        items = live;
    }

    return <ComparePage locale={locale} items={items} />;
}
