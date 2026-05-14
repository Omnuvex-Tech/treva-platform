import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/app/components/Projects/ProjectDetail";
import { getProjectBySlug } from "@/lib/project-data";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);

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

export default async function DynamicProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetail locale={locale} project={project} />;
}
