import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import PageContainer from "@/app/components/Container/PageContainer";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { ProjectsGrid } from "@/app/components/Projects/ProjectsGrid";
import { ProjectsHero } from "@/app/components/Projects/ProjectsHero";
import { config } from "@/config";
import VisionHero from "@/app/components/Projects/VisionHero.tsx";

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

    return (
        <>
        <div className="" data-locale={locale}>
  <Navbar locale={locale} />
            {/* <PageContainer as="main"> */}
                <VisionHero />
                {/* <ProjectsGrid /> */}
            {/* </PageContainer> */}
            <HomeFooter locale={locale} />
        </div>
          
        </>
    );
}
