"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import { ProjectFeaturesData } from "@/lib/projects.types";
import "./project-details.css";

interface Props {
  data: ProjectFeaturesData;
}

export default function ProjectFeatures({ data }: Props) {
  return (
    <section className="pd-wrapper">
      <PageContainer>
        {/* HEADER */}
        <div className="pd-header">
          <div className="pd-header-left">
            <p className="pd-header-main">
              {data.headerMain}
            </p>
            <hr className="pd-divider" />
            <p className="pd-header-sub">
              {data.headerSub}
            </p>
          </div>
          <div className="pd-header-right">
            <h2 className="pd-section-title">
              <span className="po-title-light">{data.titleLight}</span>
              <span className="po-title-bold">{data.titleBold}</span>
            </h2>
            <button className="pd-download-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              DOWNLOAD BROCHURE
            </button>
          </div>
        </div>

        {/* SECTIONS */}
        <div className="pd-grid">
          {data.sections.map((sec) => {
            const card = (
              <div key={sec.id + "-card"} className={`pd-card ${sec.dark ? "pd-card--dark" : "pd-card--light"}`}>
                <div className="pd-card-header">
                  <h3 className="pd-card-title">
                    <em>{sec.title.italic}</em>
                    {sec.title.rest}
                  </h3>
                  <span className="pd-card-num">.{sec.id}</span>
                </div>
                <p className="pd-card-subtitle">{sec.subtitle}</p>
                <ul className="pd-card-list">
                  {sec.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );

            const img = (
              <div key={sec.id + "-img"} className="pd-image-cell">
                <img src={sec.image} alt={`${sec.title.italic}${sec.title.rest}`} />
              </div>
            );

            return (
              <div key={sec.id} className="pd-row">
                {/* Mobile: image always first */}
                <div className="pd-mobile-only">{img}</div>
                <div className="pd-mobile-only">{card}</div>

                {/* Desktop: imageLeft logic */}
                {sec.imageLeft ? (
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
