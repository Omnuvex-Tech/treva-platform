import { notFound } from "next/navigation";
import { config } from "@/config";
import ComparePage from "@/app/components/HomeV2/ComparePage";

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
 * The actual off-plan/resale selection lives in the browser's localStorage
 * (`compare-properties.ts`), added from the listing cards — nothing to fetch
 * server-side here anymore, `ComparisonV2` reads it directly on mount.
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

    return <ComparePage locale={locale} />;
}
