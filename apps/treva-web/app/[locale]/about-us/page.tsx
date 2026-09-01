import { notFound } from "next/navigation";
import { config } from "@/config";
import { getAuthors, toAbsUrl } from "@/lib/pulse-api";
import AboutPageV2 from "@/app/components/HomeV2/AboutPage";

export function generateStaticParams() {
  return config.project.staticLanguages.map((language) => ({
    locale: language.code,
  }));
}

/**
 * About — the V2 redesign, served straight from `/[locale]/about-us`. The old
 * V1 page (`components/Home/AboutUs`) stays in the tree but no route points at
 * it; the `?v=2` switch is gone.
 */
export default async function AboutUsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const languages = [...config.project.staticLanguages];

  if (!languages.some((language) => language.code === locale)) {
    notFound();
  }

  const authors = await getAuthors(locale).catch(() => []);

  // The whole feed goes down: the grid opens on the design's six and its "more"
  // button walks the rest six at a time (TeamGridV2), so truncating here would
  // leave that button nothing to reveal.
  const members = authors.map((author) => ({
    id: author.id,
    name: author.name,
    role: author.title || "",
    avatar: toAbsUrl(author.avatar || "") || "",
    href: `/${locale}/authors/${author.slug}`,
  }));

  return <AboutPageV2 locale={locale} members={members} />;
}
