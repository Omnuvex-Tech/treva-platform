import { notFound } from "next/navigation";
import { config } from "@/config";
import { staticPageMetadata } from "@/lib/seo-fallbacks";
import PageJsonLd from "@/app/components/PageJsonLd";
import ProjectsPageV2 from "@/app/components/HomeV2/ProjectsPage";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export const generateMetadata = staticPageMetadata("projects");

/**
 * Projects — the V2 redesign, served straight from `/[locale]/projects`. The
 * old V1 page (`components/Design1/Projects`) stays in the tree but no route
 * points at it; the `?v=2` switch is gone.
 */
export default async function ProjectsRoute({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <>
            <PageJsonLd pageKey="projects" locale={locale} />
            <ProjectsPageV2 locale={locale} />
        </>
    );
}
