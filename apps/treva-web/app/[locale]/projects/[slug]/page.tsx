"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjectDetail } from "@/hooks/use-project-detail";
import { getAssetUrl } from "@/lib/asset-url";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import ProjectHero from "@/app/components/Projects/ProjectHero";
import ProjectOverview from "@/app/components/Projects/ProjectOverview";
import ProjectFeatures from "@/app/components/Projects/ProjectFeatures";
import ProjectLocation from "@/app/components/Projects/ProjectLocation";
import DynamicProjectLayouts from "@/app/components/Projects/DynamicProjectLayouts";

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
        <CallbackForm />
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
        <CallbackForm />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <ProjectHero
        title={detail.heroTitle || ""}
        desktopDescription={detail.heroDesktopDesc || ""}
        mobileDescription={detail.heroMobileDesc || ""}
        images={detail.heroImages || []}
        ctaText={detail.heroCtaText}
        ctaLink={detail.heroCtaLink}
        getImageUrl={getImageUrl}
      />

      <ProjectOverview
        titleLight={detail.overviewTitleLight || "Project "}
        titleBold={detail.overviewTitleBold || "Overview"}
        brandName={detail.overviewBrandName || ""}
        debutText={detail.overviewDebutText || ""}
        locationText={detail.overviewLocationText || ""}
        debutTextEnd={detail.overviewDebutTextEnd || ""}
        description={detail.overviewDescription || ""}
        images={{
          large: {
            url: detail.overviewImageLarge || "",
            label: detail.overviewImageLargeLabel || "",
          },
          medium: {
            url: detail.overviewImageMedium || "",
            label: detail.overviewImageMediumLabel || "",
          },
          small: {
            url: detail.overviewImageSmall || "",
            label: detail.overviewImageSmallLabel || "",
          },
        }}
        dataRows={detail.overviewDataRows || []}
        getImageUrl={getImageUrl}
      />

      <ProjectFeatures
        headerMain={detail.featuresHeaderMain || ""}
        headerSub={detail.featuresHeaderSub || ""}
        titleLight={detail.featuresTitleLight || "Project "}
        titleBold={detail.featuresTitleBold || "Details"}
        sections={detail.featuresSections || []}
        brochureFile={detail.brochureFile}
        getImageUrl={getImageUrl}
      />

      <ProjectLocation
        titleLight={detail.locationTitleLight || "Property "}
        titleBold={detail.locationTitleBold || "Location"}
        mainLead={detail.locationMainLead || ""}
        subText={detail.locationSubText || ""}
        mapImage={detail.locationMapImage || ""}
        footerAddress={detail.locationFooterAddress || ""}
        googleMapsUrl={detail.locationGoogleMapsUrl}
        getImageUrl={getImageUrl}
      />

      <DynamicProjectLayouts categorySlug={slug} locale={locale} />

      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
}
