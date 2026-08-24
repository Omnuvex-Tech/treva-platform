"use client";

/**
 * Layihə detal səhifəsinin blok renderer-i.
 *
 * CMS-dən gələn `sections` massivini gəzir və hər blokun `type`-ına görə
 * uyğun komponenti render edir. Blokların sırası massivin sırasıdır —
 * səhifədə nəyin harada duracağını CMS təyin edir, bu fayl yox.
 *
 * `isVisible === false` olan bloklar tamamilə atlanır.
 */

import React from "react";
import ProjectHero from "./ProjectHero";
import ProjectOverview from "./ProjectOverview";
import ProjectFeatures from "./ProjectFeatures";
import ProjectLocation from "./ProjectLocation";
import ProjectGallery from "./ProjectGallery";
import DynamicProjectLayouts from "./DynamicProjectLayouts";
import { ProjectGalleryProvider } from "@/app/components/Gallery/ProjectGalleryContext";
import type { GalleryImage } from "@/app/components/Gallery/GalleryLightbox";
import { loc } from "@/lib/project-detail.types";
import type {
  ProjectSection,
  HeroSection,
  OverviewSection,
  FeaturesSection,
  LocationSection,
  GallerySection,
} from "@/lib/project-detail.types";

/**
 * Bölmə başlıqlarının standart dəyərləri.
 *
 * Bunlar yalnız CMS-də başlıq sahəsi boş qaldıqda işlənir. Əvvəl hər üç dil
 * üçün ingiliscə ("Project Overview") idi — nəticədə azərbaycanca səhifədə
 * ingilis başlıq görünürdü.
 */
const sectionTitleDefaults = {
  az: {
    overviewLight: "Layihə ", overviewBold: "haqqında",
    featuresLight: "Layihə ", featuresBold: "detalları",
    locationLight: "Layihənin ", locationBold: "yeri",
    galleryLight: "Foto ", galleryBold: "qalereya",
  },
  en: {
    overviewLight: "Project ", overviewBold: "Overview",
    featuresLight: "Project ", featuresBold: "Details",
    locationLight: "Property ", locationBold: "Location",
    galleryLight: "Interior ", galleryBold: "Gallery",
  },
  ru: {
    overviewLight: "О ", overviewBold: "проекте",
    featuresLight: "Детали ", featuresBold: "проекта",
    locationLight: "Расположение ", locationBold: "объекта",
    galleryLight: "Фото", galleryBold: "галерея",
  },
} as const;

interface Props {
  sections: ProjectSection[];
  categorySlug: string;
  fallbackCategorySlug: string;
  locale: string;
  getImageUrl: (url: string) => string;
  onCtaClick?: () => void;
}

export default function ProjectSections({
  sections,
  categorySlug,
  fallbackCategorySlug,
  locale,
  getImageUrl,
  onCtaClick,
}: Props) {
  const d = sectionTitleDefaults[locale as keyof typeof sectionTitleDefaults] ?? sectionTitleDefaults.az;

  const visible = React.useMemo(
    () => (sections || []).filter((section) => section?.isVisible !== false),
    [sections],
  );

  // Səhifənin ümumi qalereyası. Sıra CMS bloklarının sırasıdır: hero kadrları,
  // sonra ümumi baxış şəkilləri, sonra interyer bölmələrinin şəkilləri.
  // Xəritə (location) və mənzil planları (layouts) qalereyaya girmir — onlar
  // layihənin fotoşəkli deyil.
  const galleryImages = React.useMemo<GalleryImage[]>(() => {
    const out: GalleryImage[] = [];
    const push = (url?: string, label?: string) => {
      if (!url) return;
      const full = getImageUrl(url);
      if (out.some((img) => img.url === full)) return;
      out.push({ url: full, alt: label, label });
    };

    for (const section of visible) {
      switch (section.type) {
        case "hero": {
          const s = section as HeroSection;
          (s.images || []).forEach((img) => push(img.url, loc(img.alt, locale)));
          break;
        }
        case "overview": {
          const s = section as OverviewSection;
          (["large", "medium", "small"] as const).forEach((size) =>
            push(s.images?.[size]?.url, loc(s.images?.[size]?.label, locale)),
          );
          break;
        }
        case "gallery": {
          const s = section as GallerySection;
          (s.items || []).forEach((item) => push(item.url, loc(item.caption, locale)));
          break;
        }
        case "features": {
          // İnteryer şəkilləri — hər bölmənin öz kadrı.
          const s = section as FeaturesSection;
          (s.sections || []).forEach((block) =>
            push(
              block.image,
              `${loc(block.titleItalic, locale)} ${loc(block.titleRest, locale)}`.trim(),
            ),
          );
          break;
        }
      }
    }

    return out;
  }, [visible, locale, getImageUrl]);

  return (
    <ProjectGalleryProvider images={galleryImages} locale={locale}>
      {visible.map((section, index) => {
        const key = `${section.type}-${index}`;

        switch (section.type) {
          case "hero": {
            const s = section as HeroSection;
            return (
              <ProjectHero
                key={key}
                title={loc(s.title, locale)}
                desktopDescription={loc(s.desktopDesc, locale)}
                mobileDescription={loc(s.mobileDesc, locale)}
                images={(s.images || []).map((img) => ({
                  url: img.url,
                  alt: loc(img.alt, locale),
                }))}
                ctaText={loc(s.ctaText, locale)}
                ctaLink={s.ctaLink}
                onCtaClick={onCtaClick}
                getImageUrl={getImageUrl}
                locale={locale}
              />
            );
          }

          case "overview": {
            const s = section as OverviewSection;
            return (
              <ProjectOverview
                key={key}
                titleLight={loc(s.titleLight, locale, d.overviewLight)}
                titleBold={loc(s.titleBold, locale, d.overviewBold)}
                brandName={loc(s.brandName, locale)}
                debutText={loc(s.debutText, locale)}
                locationText={loc(s.locationText, locale)}
                debutTextEnd={loc(s.debutTextEnd, locale)}
                description={loc(s.description, locale)}
                images={{
                  large: {
                    url: s.images?.large?.url || "",
                    label: loc(s.images?.large?.label, locale),
                  },
                  medium: {
                    url: s.images?.medium?.url || "",
                    label: loc(s.images?.medium?.label, locale),
                  },
                  small: {
                    url: s.images?.small?.url || "",
                    label: loc(s.images?.small?.label, locale),
                  },
                }}
                dataRows={s.dataRows || []}
                locale={locale}
                getImageUrl={getImageUrl}
              />
            );
          }

          case "features": {
            const s = section as FeaturesSection;
            return (
              <ProjectFeatures
                key={key}
                headerMain={loc(s.headerMain, locale)}
                headerSub={loc(s.headerSub, locale)}
                titleLight={loc(s.titleLight, locale, d.featuresLight)}
                titleBold={loc(s.titleBold, locale, d.featuresBold)}
                sections={s.sections || []}
                brochureFile={s.brochureFile}
                locale={locale}
                getImageUrl={getImageUrl}
              />
            );
          }

          case "location": {
            const s = section as LocationSection;
            return (
              <ProjectLocation
                key={key}
                titleLight={loc(s.titleLight, locale, d.locationLight)}
                titleBold={loc(s.titleBold, locale, d.locationBold)}
                brandName={loc(s.brandName, locale)}
                mainLead={loc(s.mainLead, locale)}
                subText={loc(s.subText, locale)}
                mapImage={s.mapImage || ""}
                footerAddress={loc(s.footerAddress, locale)}
                googleMapsUrl={s.googleMapsUrl}
                getImageUrl={getImageUrl}
                locale={locale}
              />
            );
          }

          case "gallery": {
            const s = section as GallerySection;
            return (
              <ProjectGallery
                key={key}
                titleLight={loc(s.titleLight, locale, d.galleryLight)}
                titleBold={loc(s.titleBold, locale, d.galleryBold)}
                description={loc(s.description, locale)}
                items={(s.items || []).map((item) => ({
                  url: item.url,
                  caption: loc(item.caption, locale),
                }))}
                getImageUrl={getImageUrl}
              />
            );
          }

          case "layouts":
            return (
              <DynamicProjectLayouts
                key={key}
                categorySlug={categorySlug}
                fallbackCategorySlug={fallbackCategorySlug}
                locale={locale}
              />
            );

          default:
            // Tanınmayan blok tipi — CMS-də yeni tip əlavə olunub, web hələ
            // deploy olunmayıb. Səhifəni sındırmaq əvəzinə sadəcə atlayırıq.
            return null;
        }
      })}
    </ProjectGalleryProvider>
  );
}
