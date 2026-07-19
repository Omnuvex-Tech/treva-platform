import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import AboutUs from "@/app/components/Home/AboutUs/AboutUs";
import GsapScripts from "@/app/components/GsapScripts";
import AboutTeam from "@/app/components/Home/AboutTeam/AboutTeam";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return config.project.staticLanguages.map((language) => ({
    locale: language.code,
  }));
}

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

  return (
    <>
      <GsapScripts />
      <Navbar locale={locale} variant="solid" />
      <AboutUs locale={locale} />
      <AboutTeam locale={locale} />
      <HomeFooter locale={locale} />
    </>
  );
}
