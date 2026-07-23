"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import "./project-details.css";

interface LocalizedString {
  az?: string;
  en?: string;
  ru?: string;
}

interface FeatureSection {
  id: string;
  titleItalic: LocalizedString;
  titleRest: LocalizedString;
  subtitle: LocalizedString;
  items: LocalizedString[];
  dark: boolean;
  image: string;
  imageLeft: boolean;
}

interface Props {
  headerMain: string;
  headerSub: string;
  titleLight: string;
  titleBold: string;
  sections: FeatureSection[];
  brochureFile?: string;
  locale: string;
  getImageUrl: (url: string) => string;
}

function loc(obj: LocalizedString | undefined | null, locale: string, fallback = ""): string {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj || fallback;
  return (obj as any)[locale] || obj.az || obj.en || obj.ru || fallback;
}

export default function ProjectFeatures({
  headerMain,
  headerSub,
  titleLight,
  titleBold,
  sections,
  brochureFile,
  locale,
  getImageUrl,
}: Props) {
  const handleBrochureDownload = () => {
    if (brochureFile) {
      window.open(getImageUrl(brochureFile), "_blank");
    }
  };

  return (
    <section className="pd-wrapper">
      <PageContainer className="pde-page-container">
        {/* HEADER */}
        <div className="pd-header">
          <div className="pd-header-left">
            {headerMain && <p className="pd-header-main">{headerMain}</p>}
            <hr className="pd-divider" />
            {headerSub && <p className="pd-header-sub">{headerSub}</p>}
          </div>
          <div className="pd-header-right">
            <h2 className="pd-section-title">
              <span className="po-title-light">{titleLight}</span>
              <span className="po-title-bold">{titleBold}</span>
            </h2>
            {brochureFile && (
              <button className="pd-download-btn" onClick={handleBrochureDownload}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                DOWNLOAD BROCHURE
              </button>
            )}
          </div>
        </div>

        {/* SECTIONS */}
        <div className="pd-grid">
          {sections.map((sec, index) => {
            const isImageLeft = index % 2 === 0;

            const card = (
              <div
                key={sec.id + "-card"}
                className={`pd-card ${sec.dark ? "pd-card--dark" : "pd-card--light"}`}
              >
                <div className="pd-card-header">
                  <h3 className="pd-card-title">
                    {loc(sec.titleItalic, locale) && <em>{loc(sec.titleItalic, locale)}</em>}
                    {loc(sec.titleRest, locale)}
                  </h3>
                  <span className="pd-card-num">.{sec.id}</span>
                </div>
                {loc(sec.subtitle, locale) && (
                  <p className="pd-card-subtitle">{loc(sec.subtitle, locale)}</p>
                )}
                {sec.items.length > 0 && (
                  <ul className="pd-card-list">
                    {sec.items.map((item, i) => (
                      <li key={i}>{loc(item, locale)}</li>
                    ))}
                  </ul>
                )}
              </div>
            );

            const img = sec.image ? (
              <div key={sec.id + "-img"} className="pd-image-cell">
                <img
                  src={getImageUrl(sec.image)}
                  alt={`${loc(sec.titleItalic, locale)} ${loc(sec.titleRest, locale)}`.trim()}
                />
              </div>
            ) : null;

            return (
              <div key={sec.id} className="pd-row">
                {/* Mobile: image always first */}
                {img && <div className="pd-mobile-only">{img}</div>}
                <div className="pd-mobile-only">{card}</div>

                {/* Desktop: automatic alternating layout */}
                {isImageLeft ? (
                  <>
                    <div className="pd-desktop-only">{img}</div>
                    <div className="pd-desktop-only">{card}</div>
                  </>
                ) : (
                  <>
                    <div className="pd-desktop-only">{card}</div>
                    <div className="pd-desktop-only">{img}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
