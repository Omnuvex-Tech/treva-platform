"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjectDetail } from "@/hooks/use-project-detail";
import { useCategoryLocation } from "@/hooks/use-category-location";
import { getAssetUrl } from "@/lib/asset-url";
import Navbar from "@/app/components/HomeV2/V2Nav";
import { HomeFooter } from "@/app/components/HomeV2/V2Footer";
import CallbackV2 from "@/app/components/HomeV2/V2Callback";
import ProjectSections from "@/app/components/Projects/ProjectSections";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const localeParam = (params as any)?.locale as string | string[] | undefined;
  const locale = Array.isArray(localeParam)
    ? localeParam[0] ?? "az"
    : localeParam ?? "az";

  // Yüklənmə mətni sabit azərbaycanca idi.
  const loadingText = { az: 'Yüklənir...', en: 'Loading...', ru: 'Загрузка...' }[
    locale as 'az' | 'en' | 'ru'
  ] ?? 'Yüklənir...';

  const { data: detail, isLoading, error } = useProjectDetail(slug);

  // Xəritə inventory admin-də obyektin "Location" tabında saxlanır — CMS
  // blokundan asılı olmadan burada göstərilir.
  const { data: categoryLocation } = useCategoryLocation([detail?.categorySlug, slug]);
  const adminMapUrl =
    categoryLocation?.locationGoogleMapsUrl || categoryLocation?.locationUrl || "";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return getAssetUrl(url);
  };

  const scrollToCallbackCTA = () => {
    if (typeof window === "undefined") return;

    // The CTA above the footer is now the V2 callback banner (.hv2-s-callback);
    // 96px clears the sticky V2 header that sits over the scrolled-to point.
    const target = document.querySelector(".hv2-s-callback");
    if (!target) return;

    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - 96, 0),
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
            <p>{loadingText}</p>
          </div>
        </main>
        <CallbackV2 locale={locale} />
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
        <CallbackV2 locale={locale} />
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
        adminMapUrl={adminMapUrl}
      />

      <CallbackV2 locale={locale} />

      <HomeFooter locale={locale} />
    </div>
  );
}
