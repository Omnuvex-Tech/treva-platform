import React, { cache } from "react";
import type { Metadata } from "next";
import PulseArticleDetail from "@/app/components/Pulse/PulseArticleDetail";
import PageJsonLd from "@/app/components/PageJsonLd";
import { getArticleBySlug, getArticles, apiArticleToArticle, getLocalized, toAbsUrl } from "@/lib/pulse-api";
import { buildPageMetadata } from "@/lib/seo";
import { Article } from "@/lib/pulse.types";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/** generateMetadata + səhifə eyni sorğunu bölüşsün deyə keşlənir. */
const loadArticle = cache((slug: string) => getArticleBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const apiArticle = await loadArticle(slug);
    return buildPageMetadata({
      pageKey: `pulse:${apiArticle.id}`,
      locale,
      fallback: {
        title: getLocalized(apiArticle.title, locale),
        description: getLocalized(apiArticle.excerpt, locale),
        ogImage: apiArticle.coverImage ? toAbsUrl(apiArticle.coverImage) : undefined,
      },
    });
  } catch {
    return {};
  }
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  let apiArticle;
  try {
    apiArticle = await loadArticle(slug);
  } catch (error) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      apiArticle = await getArticleBySlug(slug);
    } catch {
      const status = (error as any)?.status;
      if (status === 404) notFound();
      throw error;
    }
  }

  const article = apiArticleToArticle(apiArticle, locale);

  let sidebarArticles: Article[] = [];
  let relatedArticles: Article[] = [];

  if (apiArticle.selectedArticles && apiArticle.selectedArticles.length > 0) {
    sidebarArticles = apiArticle.selectedArticles.map(a => apiArticleToArticle(a, locale));
  }

  try {
    const result = await getArticles({ limit: 10, summary: true });
    const all = result.data.map(a => apiArticleToArticle(a, locale));
    if (sidebarArticles.length === 0) {
      sidebarArticles = all.filter((a) => a.slug !== slug).slice(0, 4);
    }
    relatedArticles = all.filter((a) => a.slug !== slug).slice(0, 6);
  } catch {
    // fallback to empty
  }

  return (
    <>
      <PageJsonLd pageKey={`pulse:${apiArticle.id}`} locale={locale} />
      <PulseArticleDetail
        locale={locale}
        article={article}
        sidebarArticles={sidebarArticles}
        relatedArticles={relatedArticles}
      />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const result = await getArticles({ limit: 200, summary: true });
    const locales = ["az", "en", "ru"];
    const params: { locale: string; slug: string }[] = [];
    for (const locale of locales) {
      for (const article of result.data) {
        params.push({ locale, slug: article.slug });
      }
    }
    return params;
  } catch {
    return [];
  }
}
