import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/app/components/Design1/Projects/ProjectDetail";
import { getProjectBySlug } from "@/lib/project-data";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import VisionHero from "@/app/components/Projects/VisionHero.tsx";
import ProjectOverview from "@/app/components/Projects/ProjectOverview";
import ProjectDetails from "@/app/components/Projects/ProjectDetails";
import PropertyLocation from "@/app/components/Projects/PropertyLocation";
import UnitLayout from "@/app/components/Projects/UnitLayout";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

const FALLBACK_SLUG = "villa-siena";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug) ?? getProjectBySlug(FALLBACK_SLUG);

  if (!project) return {};

  const title = project.seoTitle[locale] || project.seoTitle.az;
  const description = project.seoDescription[locale] || project.seoDescription.az;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: project.ogImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.ogImage],
    },
  };
}

export default async function DynamicProjectPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug) ?? getProjectBySlug(FALLBACK_SLUG);

  if (!project) {
    notFound();
  }

  const design = typeof searchParams?.design === "string" ? searchParams.design : undefined;
  const variant = typeof searchParams?.variant === "string" ? searchParams.variant : undefined;

  if (design === "2" || variant === "2") {
    return <ProjectDetail locale={locale} project={project} />;
  }

  return (
    <div data-locale={locale}>
      <Navbar locale={locale} />
      <VisionHero />
      <ProjectOverview />
      <ProjectDetails />
      <PropertyLocation />
      <UnitLayout />
      <HomeFooter locale={locale} />
    </div>
  );
}
