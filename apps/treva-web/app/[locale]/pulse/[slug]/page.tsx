import React from "react";
import PulseArticleDetail from "@/app/components/Pulse/PulseArticleDetail";
import { getArticleBySlug, getArticles, apiArticleToArticle } from "@/lib/pulse-api";
import { Article } from "@/lib/pulse.types";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  let apiArticle;
  try {
    apiArticle = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  const article = apiArticleToArticle(apiArticle, locale);

  let sidebarArticles: Article[] = [];
  let relatedArticles: Article[] = [];

  if (apiArticle.selectedArticles && apiArticle.selectedArticles.length > 0) {
    sidebarArticles = apiArticle.selectedArticles.map(a => apiArticleToArticle(a, locale));
  }

  try {
    const result = await getArticles({ limit: 10 });
    const all = result.data.map(a => apiArticleToArticle(a, locale));
    if (sidebarArticles.length === 0) {
      sidebarArticles = all.filter((a) => a.slug !== slug).slice(0, 4);
    }
    relatedArticles = all.filter((a) => a.slug !== slug).slice(0, 6);
  } catch {
    // fallback to empty
  }

  return (
    <PulseArticleDetail
      locale={locale}
      article={article}
      sidebarArticles={sidebarArticles}
      relatedArticles={relatedArticles}
    />
  );
}

export async function generateStaticParams() {
  try {
    const result = await getArticles({ limit: 200 });
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
