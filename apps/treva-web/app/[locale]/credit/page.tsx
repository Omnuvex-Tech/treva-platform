import { notFound } from "next/navigation";
import { config } from "@/config";
import CreditPage from "@/app/components/HomeV2/CreditPage";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

/**
 * Credit calculator — Figma 635:21099.
 *
 * Like the comparison page there is no V1 of this screen, so the route renders
 * the V2 design outright rather than gating it behind `?v=2`.
 */
export default async function CreditRoute({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!config.project.staticLanguages.some((language) => language.code === locale)) {
        notFound();
    }

    return <CreditPage locale={locale} />;
}
