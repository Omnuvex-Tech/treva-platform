import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cache } from "react";
import PageJsonLd from "@/app/components/PageJsonLd";
import { buildPageMetadata, pickLocalized } from "@/lib/seo";

/**
 * `projects/[slug]` detalı client komponentdir — SEO (meta + JSON-LD) buradan,
 * layout-dan verilir. Admin-də dinamik açar `project:<kateqoriya id>` formatında
 * saxlanır, ona görə əvvəlcə slug → id həll edirik.
 */

const CMS_API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10021";

type Category = {
  id: string;
  slug: string;
  title?: unknown;
  description?: unknown;
};

const loadCategory = cache(async (slug: string): Promise<Category | null> => {
  try {
    const res = await fetch(
      `${CMS_API}/layihelerimiz/categories/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Category;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await loadCategory(slug);
  if (!category?.id) return {};
  return buildPageMetadata({
    pageKey: `project:${category.id}`,
    locale,
    fallback: {
      title: pickLocalized(category.title, locale) || undefined,
      description: pickLocalized(category.description, locale) || undefined,
    },
  });
}

export default async function ProjectDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const category = await loadCategory(slug);
  return (
    <>
      {category?.id && (
        <PageJsonLd pageKey={`project:${category.id}`} locale={locale} />
      )}
      {children}
    </>
  );
}
