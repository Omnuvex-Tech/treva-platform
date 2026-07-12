"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjectDetail } from "@/hooks/use-project-detail";
import type { LocalizedString } from "@/lib/project-detail.types";
import { getAssetUrl } from "@/lib/asset-url";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import ProjectHero from "@/app/components/Projects/ProjectHero";
import ProjectOverview from "@/app/components/Projects/ProjectOverview";
import ProjectFeatures from "@/app/components/Projects/ProjectFeatures";
import ProjectLocation from "@/app/components/Projects/ProjectLocation";
import DynamicProjectLayouts from "@/app/components/Projects/DynamicProjectLayouts";

function loc(obj: LocalizedString | undefined | null, locale: string, fallback = ""): string {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj || fallback;
  return (obj as any)[locale] || obj.az || obj.en || obj.ru || fallback;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const localeParam = (params as any)?.locale as string | string[] | undefined;
  const locale = Array.isArray(localeParam)
    ? localeParam[0] ?? "az"
    : localeParam ?? "az";

  const { data: detail, isLoading, error } = useProjectDetail(slug);

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return getAssetUrl(url);
  };

  const scrollToCallbackCTA = () => {
    if (typeof window === "undefined") return;

    const target = document.querySelector(".callbackContainer");
    if (!target) return;

    const navHeightValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--treva-nav-height");
    const navHeight = Number.parseFloat(navHeightValue) || 64;
    const offset = navHeight + 24;

    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0),
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Navbar locale={locale} />
        <main
          className="main-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div style={{ textAlign: "center", color: "#6d717a" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #e5e7eb",
                borderTopColor: "#1e3a5f",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p>Yüklənir...</p>
          </div>
        </main>
        <CallbackForm allowedRoles={['Client']} />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="page-wrapper">
        <Navbar locale={locale} />
        <main
          className="main-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div style={{ textAlign: "center", color: "#6d717a" }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>
              Layihə tapılmadı
            </p>
            <Link
              href={`/${locale}/projects`}
              style={{ color: "#1e3a5f", fontSize: 14 }}
            >
              ← Bütün layihələr
            </Link>
          </div>
        </main>
        <CallbackForm allowedRoles={['Client']} />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <ProjectHero
        title={loc(detail.heroTitle, locale)}
        desktopDescription={loc(detail.heroDesktopDesc, locale)}
        mobileDescription={loc(detail.heroMobileDesc, locale)}
        images={detail.heroImages || []}
        ctaText={loc(detail.heroCtaText, locale)}
        ctaLink={detail.heroCtaLink}
        onCtaClick={scrollToCallbackCTA}
        getImageUrl={getImageUrl}
      />

      <ProjectOverview
        titleLight={loc(detail.overviewTitleLight, locale, "Project ")}
        titleBold={loc(detail.overviewTitleBold, locale, "Overview")}
        brandName={loc(detail.overviewBrandName, locale)}
        debutText={loc(detail.overviewDebutText, locale)}
        locationText={loc(detail.overviewLocationText, locale)}
        debutTextEnd={loc(detail.overviewDebutTextEnd, locale)}
        description={loc(detail.overviewDescription, locale)}
        images={{
          large: {
            url: detail.overviewImageLarge || "",
            label: loc(detail.overviewImageLargeLabel, locale),
          },
          medium: {
            url: detail.overviewImageMedium || "",
            label: loc(detail.overviewImageMediumLabel, locale),
          },
          small: {
            url: detail.overviewImageSmall || "",
            label: loc(detail.overviewImageSmallLabel, locale),
          },
        }}
        dataRows={detail.overviewDataRows || []}
        getImageUrl={getImageUrl}
      />

      <ProjectFeatures
        headerMain={loc(detail.featuresHeaderMain, locale)}
        headerSub={loc(detail.featuresHeaderSub, locale)}
        titleLight={loc(detail.featuresTitleLight, locale, "Project ")}
        titleBold={loc(detail.featuresTitleBold, locale, "Details")}
        sections={detail.featuresSections || []}
        brochureFile={detail.brochureFile}
        getImageUrl={getImageUrl}
      />

      <ProjectLocation
        titleLight={loc(detail.locationTitleLight, locale, "Property ")}
        titleBold={loc(detail.locationTitleBold, locale, "Location")}
        brandName={loc(detail.locationBrandName, locale)}
        mainLead={loc(detail.locationMainLead, locale)}
        subText={loc(detail.locationSubText, locale)}
        mapImage={detail.locationMapImage || ""}
        footerAddress={loc(detail.locationFooterAddress, locale)}
        googleMapsUrl={detail.locationGoogleMapsUrl}
        getImageUrl={getImageUrl}
      />

      <DynamicProjectLayouts categorySlug={slug} locale={locale} />

      <CallbackForm allowedRoles={['Client']} />

      <HomeFooter locale={locale} />
    </div>
  );
}
