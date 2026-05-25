import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/app/components/Design1/Projects/ProjectDetail";
import { getProjectBySlug } from "@/lib/project-data";

type Props = {
  params: Promise<{ locale: string }>;
};

const SLUG = "villa-siena";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const project = getProjectBySlug(SLUG);

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

export default async function VillaSienaPage({ params }: Props) {
  const { locale } = await params;
  const project = getProjectBySlug(SLUG);

  if (!project) {
    notFound();
  }

  return <ProjectDetail locale={locale} project={project} />;
}
