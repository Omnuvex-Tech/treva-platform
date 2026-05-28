import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectModelBySlug } from "@/lib/projects";
import Navbar from "@/app/components/Design1/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";

import {
  ProjectHero,
  ProjectOverview,
  ProjectLocation,
  ProjectLayouts,
  ProjectFeatures
} from "@/app/components/Projects";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectModelBySlug(slug);

  if (!project) return {};

  const title = project.seoTitle[locale] || project.seoTitle.en;
  const description = project.seoDescription[locale] || project.seoDescription.en;

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
          alt: title,
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
  const project = getProjectModelBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="page-wrapper">
      <Navbar locale={locale} />
      
      <main className="main-wrapper">
        <ProjectHero data={project.hero} />
        <ProjectOverview data={project.overview} />
        <ProjectLocation data={project.location} />
        <ProjectLayouts layouts={project.layouts} />
        <ProjectFeatures data={project.features} />
      </main>

      <HomeFooter locale={locale} />
    </div>
  );
}
