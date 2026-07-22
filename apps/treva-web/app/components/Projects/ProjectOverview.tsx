"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
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
  return (
    <section className="po-section">
      <PageContainer>
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

            {description && (
              <p className="po-description">{description}</p>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div className="po-images-grid">
          {images.large.url && (
            <div className="po-image-card po-card-large">
              <span className="po-image-label">{images.large.label}</span>
              <div className="po-image-wrapper">
                <img
                  src={getImageUrl(images.large.url)}
                  alt={images.large.label}
                  className="po-img"
                />
              </div>
            </div>
          )}

          {images.medium.url && (
            <div className="po-image-card po-card-medium">
              <span className="po-image-label">{images.medium.label}</span>
              <div className="po-image-wrapper">
                <img
                  src={getImageUrl(images.medium.url)}
                  alt={images.medium.label}
                  className="po-img"
                />
              </div>
            </div>
          )}

          {images.small.url && (
            <div className="po-image-card po-card-small">
              <span className="po-image-label">{images.small.label}</span>
              <div className="po-image-wrapper">
                <img
                  src={getImageUrl(images.small.url)}
                  alt={images.small.label}
                  className="po-img"
                />
              </div>
            </div>
          )}
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
