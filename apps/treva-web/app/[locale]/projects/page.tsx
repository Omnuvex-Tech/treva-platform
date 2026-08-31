import { notFound } from "next/navigation";
import { config } from "@/config";
import { ProjectsPage } from "@/app/components/Design1/Projects/projects";
import ProjectsPageV2 from "@/app/components/HomeV2/ProjectsPage";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

/** `?v=2` renders the redesign; anything else keeps the current projects page. */
function resolveDesignVersion(value: string | string[] | undefined): "v1" | "v2" {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw === "2" || raw === "v2" ? "v2" : "v1";
}

export default async function ProjectsRoute({
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

    if (resolveDesignVersion(v) === "v2") {
        return <ProjectsPageV2 locale={locale} />;
    }

    return <ProjectsPage locale={locale} />;
}
