import type { Metadata } from "next";

import { ListingsView } from "@/features/floor-plan/components/listings-view";
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

    return { title: t.floorPlan.title };
}

export default async function FloorPlanPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ project?: string | string[] }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "floorplan:read");

    // A project screen's "Page Link" sends ?project=<id>: Listings then shows
    // only that project's buildings.
    const { project } = await searchParams;
    const projectId = typeof project === "string" && project ? project : undefined;

    // Magazine opens on Listings (886:15740); picking a building goes to
    // /magazine/[id], which is where the tab strip lives.
    return <ListingsView projectId={projectId} />;
}
