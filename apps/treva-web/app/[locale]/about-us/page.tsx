import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import AboutUs from "@/app/components/Home/AboutUs/AboutUs";
import GsapScripts from "@/app/components/GsapScripts";
import AboutTeam from "@/app/components/Home/AboutTeam/AboutTeam";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { config } from "@/config";
import { getAuthors, toAbsUrl } from "@/lib/pulse-api";
import AboutPageV2 from "@/app/components/HomeV2/AboutPage";

export function generateStaticParams() {
  return config.project.staticLanguages.map((language) => ({
    locale: language.code,
  }));
}

/** `?v=2` renders the redesign; anything else keeps the current about page. */
function resolveDesignVersion(value: string | string[] | undefined): "v1" | "v2" {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "2" || raw === "v2" ? "v2" : "v1";
}

export default async function AboutUsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { v } = await searchParams;
  const languages = [...config.project.staticLanguages];

  if (!languages.some((language) => language.code === locale)) {
    notFound();
  }

  const authors = await getAuthors(locale).catch(() => []);

  if (resolveDesignVersion(v) === "v2") {
    // The whole feed goes down now: the grid opens on the design's six and its
    // "more" button walks the rest of the list six at a time (TeamGridV2), so
    // truncating here would leave that button nothing to reveal.
    const members = authors.map((author) => ({
      id: author.id,
      name: author.name,
      role: author.title || "",
      avatar: toAbsUrl(author.avatar || "") || "",
      href: `/${locale}/authors/${author.slug}`,
    }));

    return <AboutPageV2 locale={locale} members={members} />;
  }

  return (
    <>
      <GsapScripts />
      <Navbar locale={locale} variant="solid" />
      <AboutUs locale={locale} />
      <AboutTeam locale={locale} authors={authors} />
      <HomeFooter locale={locale} />
    </>
  );
}
