import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/app/components/Design1/Projects/ProjectDetail";
import { getProjectBySlug } from "@/lib/project-data";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import {
  ProjectFeatures,
  ProjectHero,
  ProjectLayouts,
  ProjectLocation,
  ProjectOverview,
} from "@/app/components/Projects";
import { getProjectModelBySlug } from "@/lib/projects";
import DynamicProjectLayouts from "@/app/components/Projects/DynamicProjectLayouts";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

const FALLBACK_DETAIL_SLUG = "villa-siena";
const FALLBACK_MODEL_SLUG = "panorama-by-elie-saab";

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const design = typeof searchParams?.design === "string" ? searchParams.design : undefined;
  const variant = typeof searchParams?.variant === "string" ? searchParams.variant : undefined;

  if (design === "2" || variant === "2") {
    const detail = getProjectBySlug(slug) ?? getProjectBySlug(FALLBACK_DETAIL_SLUG);
    if (!detail) return {};

    const title = detail.seoTitle[locale] || detail.seoTitle.en;
    const description = detail.seoDescription[locale] || detail.seoDescription.en;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: detail.ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title, description, images: [detail.ogImage] },
    };
  }

  const model = getProjectModelBySlug(slug) ?? getProjectModelBySlug(FALLBACK_MODEL_SLUG);
  if (!model) return {};

  const title = model.seoTitle[locale] ?? model.seoTitle.en ?? Object.values(model.seoTitle)[0];
  const description =
    model.seoDescription[locale] ?? model.seoDescription.en ?? Object.values(model.seoDescription)[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: model.ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [model.ogImage] },
  };
}

export default async function DynamicProjectPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;

  const design = typeof searchParams?.design === "string" ? searchParams.design : undefined;
  const variant = typeof searchParams?.variant === "string" ? searchParams.variant : undefined;

  if (design === "2" || variant === "2") {
    const detail = getProjectBySlug(slug) ?? getProjectBySlug(FALLBACK_DETAIL_SLUG);
    if (!detail) notFound();
    return <ProjectDetail locale={locale} project={detail} />;
  }

  const model = getProjectModelBySlug(slug) ?? getProjectModelBySlug(FALLBACK_MODEL_SLUG);
  if (!model) notFound();

  return (
    <div data-locale={locale}>
      <Navbar locale={locale} />
      <ProjectHero data={model.hero} />
      <ProjectOverview data={model.overview} />
      <ProjectFeatures data={model.features} />
      <ProjectLocation data={model.location} />
      <DynamicProjectLayouts categorySlug={slug} fallbackLayouts={model.layouts} locale={locale} />
      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
}
