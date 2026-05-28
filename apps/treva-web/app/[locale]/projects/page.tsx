import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { config } from "@/config";
import { getProjectModelBySlug } from "@/lib/projects";
import {
  ProjectHero,
  ProjectOverview,
  ProjectFeatures,
  ProjectLocation,
  ProjectLayouts
} from "@/app/components/Projects";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function ProjectsRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    // Temporarily fetch the dummy project to populate the page and fix TS errors
    const project = getProjectModelBySlug("panorama-by-elie-saab");

    if (!project) {
        notFound();
    }

    return (
        <div className="" data-locale={locale}>
            <Navbar locale={locale} />
            <ProjectHero data={project.hero} />
            <ProjectOverview data={project.overview} />
            <ProjectFeatures data={project.features} />
            <ProjectLocation data={project.location} />
            <ProjectLayouts layouts={project.layouts} />
            <HomeFooter locale={locale} />
        </div>
    );
}
