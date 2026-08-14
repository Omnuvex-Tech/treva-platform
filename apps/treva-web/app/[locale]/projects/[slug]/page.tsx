"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjectDetail } from "@/hooks/use-project-detail";
import { getAssetUrl } from "@/lib/asset-url";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import ProjectSections from "@/app/components/Projects/ProjectSections";

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
      <ProjectSections
        sections={detail.sections || []}
        categorySlug={detail.categorySlug}
        fallbackCategorySlug={slug}
        locale={locale}
        getImageUrl={getImageUrl}
        onCtaClick={scrollToCallbackCTA}
      />

      <CallbackForm allowedRoles={['Client']} />

      <HomeFooter locale={locale} />
    </div>
  );
}
