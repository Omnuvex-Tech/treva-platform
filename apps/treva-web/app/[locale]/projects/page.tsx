import { notFound } from "next/navigation";
import { config } from "@/config";
import ProjectsPageV2 from "@/app/components/HomeV2/ProjectsPage";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

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

    return <ProjectsPageV2 locale={locale} />;
}
