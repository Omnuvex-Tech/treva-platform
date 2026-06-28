"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import "./project-details.css";

interface FeatureSection {
  id: string;
  titleItalic: string;
  titleRest: string;
  subtitle: string;
  items: string[];
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
  getImageUrl: (url: string) => string;
}

export default function ProjectFeatures({
  headerMain,
  headerSub,
  titleLight,
  titleBold,
  sections,
  brochureFile,
  getImageUrl,
}: Props) {
  const handleBrochureDownload = () => {
    if (brochureFile) {
      window.open(getImageUrl(brochureFile), "_blank");
    }
  };

  return (
    <section className="pd-wrapper">
      <PageContainer>
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
                    {sec.titleItalic && <em>{sec.titleItalic}</em>}
                    {sec.titleRest}
                  </h3>
                  <span className="pd-card-num">.{sec.id}</span>
                </div>
                {sec.subtitle && (
                  <p className="pd-card-subtitle">{sec.subtitle}</p>
                )}
                {sec.items.length > 0 && (
                  <ul className="pd-card-list">
                    {sec.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            );

            const img = sec.image ? (
              <div key={sec.id + "-img"} className="pd-image-cell">
                <img
                  src={getImageUrl(sec.image)}
                  alt={`${sec.titleItalic} ${sec.titleRest}`}
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
