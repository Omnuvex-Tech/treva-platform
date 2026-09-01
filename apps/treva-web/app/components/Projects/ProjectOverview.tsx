"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import RichText from "./RichText";
import { useProjectGallery } from "@/app/components/Gallery/ProjectGalleryContext";
import { cmsImage } from "@/lib/cms-image";
import "./project-overview.css";

interface OverviewImage {
  url: string;
  label: string;
}

interface LocalizedString {
  az?: string;
  en?: string;
  ru?: string;
}

interface DataRow {
  key: LocalizedString;
  value: LocalizedString;
}

interface Props {
  titleLight: string;
  titleBold: string;
  brandName: string;
  debutText: string;
  locationText: string;
  debutTextEnd: string;
  description: string;
  images: {
    large: OverviewImage;
    medium: OverviewImage;
    small: OverviewImage;
  };
  dataRows: DataRow[];
  locale: string;
  getImageUrl: (url: string) => string;
}

function loc(obj: LocalizedString | undefined | null, locale: string, fallback = ""): string {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj || fallback;
  return (obj as any)[locale] || obj.az || obj.en || obj.ru || fallback;
}

export default function ProjectOverview({
  titleLight,
  titleBold,
  brandName,
  debutText,
  locationText,
  debutTextEnd,
  description,
  images,
  dataRows,
  locale,
  getImageUrl,
}: Props): React.ReactElement {
  // Şəkillər səhifənin ümumi qalereyasına aiddir — siyahını ProjectSections qurur.
  const gallery = useProjectGallery();

  return (
    <section className="po-section">
      <PageContainer className="pde-page-container">
        {/* Header */}
        <div className="po-header">
          <div className="po-title-col">
            <h2 className="po-title">
              <span className="po-title-light">{titleLight}</span>
              <span className="po-title-bold">{titleBold}</span>
            </h2>
          </div>

          <div className="po-intro-col">
            <p className="po-brand-heading">
              {brandName && <span className="po-brand-name">{brandName}</span>}
              {debutText && (
                <>
                  <br className="mobile-br" />
                  <span className="po-brand-debut">{debutText}</span>
                </>
              )}
              {locationText && (
                <>
                  <br className="desktop-br" />
                  <span className="po-brand-location">{locationText}</span>{" "}
                </>
              )}
              {debutTextEnd && (
                <span className="po-brand-debut">{debutTextEnd}</span>
              )}
            </p>

            <div className="po-divider" />

            <RichText html={description} className="po-description" />
          </div>
        </div>

        {/* Images Grid — hər şəklə klik qalereyanı açır */}
        <div className="po-images-grid">
          {(["large", "medium", "small"] as const).map((size) => {
            const img = images[size];
            if (!img?.url) return null;
            const src = getImageUrl(img.url);
            const zoomable = Boolean(gallery?.has(src));
            return (
              <div key={size} className={`po-image-card po-card-${size}`}>
                <span className="po-image-label">{img.label}</span>
                <div className="po-image-wrapper">
                  <img
                    {...cmsImage(src, { max: 1200 })}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    loading="lazy"
                    decoding="async"
                    alt={img.label}
                    className={`po-img${zoomable ? " tg-zoomable" : ""}`}
                    onClick={zoomable ? () => gallery!.open(src) : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Rows */}
        {dataRows.length > 0 && (
          <div className="po-data-section">
            {dataRows.map((row, idx) => (
              <React.Fragment key={idx}>
                <div className="po-data-row">
                  <span className="po-data-key">{loc(row.key, locale)}</span>
                  <span className="po-data-val">{loc(row.value, locale)}</span>
                </div>
                {idx < dataRows.length - 1 && (
                  <hr className="po-data-line" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
