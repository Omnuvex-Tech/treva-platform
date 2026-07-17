import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import AboutUs from "@/app/components/Home/AboutUs/AboutUs";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import GsapScripts from "@/app/components/GsapScripts";
import PartnershipCTA from "@/app/components/PartnershipCTA";
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

  const ctaDictionary = {
    az: {
      primaryLabel: "Əlaqə saxlayın",
      secondaryLabel: "Layihələrlə tanış olun",
    },
    en: {
      primaryLabel: "Get in touch",
      secondaryLabel: "Explore projects",
    },
    ru: {
      primaryLabel: "Связаться с нами",
      secondaryLabel: "Посмотреть проекты",
    },
  } as const;

  const ctaContent =
    ctaDictionary[locale as keyof typeof ctaDictionary] ?? ctaDictionary.az;

  return (
    <>
      <GsapScripts />
      <Navbar locale={locale} variant="solid" />
      <AboutUs locale={locale} />
      <AboutTeam locale={locale} />
      <PartnershipCTA
        hideImagesOnMobile
        centerContentOnMobile
        primaryAction={{
          href: "#about-us-callback-cta",
          label: ctaContent.primaryLabel,
        }}
        secondaryAction={{
          href: `/${locale}/projects`,
          label: ctaContent.secondaryLabel,
        }}
      />
      <div className="about-us-callback-wrap">
        <CallbackForm sectionId="about-us-callback-cta" />
      </div>
      <HomeFooter locale={locale} />
    </>
  );
}
