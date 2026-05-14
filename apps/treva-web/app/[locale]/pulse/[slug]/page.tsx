import React from "react";
import PulseArticleDetail from "@/app/components/Pulse/PulseArticleDetail";
import { getArticleBySlug, ARTICLES } from "@/lib/pulse-data";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <PulseArticleDetail locale={locale} article={article} />;
}

export async function generateStaticParams() {
  const locales = ["az", "en", "ru"];
  const params: { locale: string; slug: string }[] = [];

  locales.forEach((locale) => {
    ARTICLES.forEach((article) => {
      params.push({ locale, slug: article.slug });
    });
  });

  return params;
}
