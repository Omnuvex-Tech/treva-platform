import { resolvePageSchema } from "@/lib/seo";

/**
 * Səhifə üçün JSON-LD (schema.org) skriptini render edir — admin-in "SEO"
 * bölməsində saxlanmış, yoxdursa cms-api-nin generasiya etdiyi schema.
 *
 * Server komponentdir; istənilən səhifənin JSX-ində çağırmaq olar:
 *   <PageJsonLd pageKey="home" locale={locale} />
 *   <PageJsonLd pageKey={`pulse:${article.id}`} locale={locale} />
 */
export default async function PageJsonLd({
  pageKey,
  locale,
}: {
  pageKey: string;
  locale: string;
}) {
  const schema = await resolvePageSchema(pageKey, locale).catch(() => null);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // schema cms-api-də qurulur, istifadəçi girişi birbaşa daxil olmur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
