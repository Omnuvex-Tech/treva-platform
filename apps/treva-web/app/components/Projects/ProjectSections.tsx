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
import DynamicProjectLayouts from "./DynamicProjectLayouts";
import { loc } from "@/lib/project-detail.types";
import type {
  ProjectSection,
  HeroSection,
  OverviewSection,
  FeaturesSection,
  LocationSection,
} from "@/lib/project-detail.types";

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
  const visible = (sections || []).filter((section) => section?.isVisible !== false);

  return (
    <>
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
              />
            );
          }

          case "overview": {
            const s = section as OverviewSection;
            return (
              <ProjectOverview
                key={key}
                titleLight={loc(s.titleLight, locale, "Project ")}
                titleBold={loc(s.titleBold, locale, "Overview")}
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
                titleLight={loc(s.titleLight, locale, "Project ")}
                titleBold={loc(s.titleBold, locale, "Details")}
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
                titleLight={loc(s.titleLight, locale, "Property ")}
                titleBold={loc(s.titleBold, locale, "Location")}
                brandName={loc(s.brandName, locale)}
                mainLead={loc(s.mainLead, locale)}
                subText={loc(s.subText, locale)}
                mapImage={s.mapImage || ""}
                footerAddress={loc(s.footerAddress, locale)}
                googleMapsUrl={s.googleMapsUrl}
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
    </>
  );
}
