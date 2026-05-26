"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import "./project-details.css";

const sections = [
  {
    id: "01",
    title: { italic: "Comfort", rest: " and Safety" },
    subtitle: "Excellence in every detail.",
    items: [
      "Underground parking space",
      "24/7 Security system",
      "Business center and workspaces",
      "Lounge and relaxation areas",
    ],
    dark: true,
    image: "/images/project-details/pd1.jpg",
    imageLeft: true,
  },
  {
    id: "02",
    title: { italic: "Wellness", rest: " and Leisure" },
    subtitle: "An oasis of tranquility and relaxation.",
    items: [
      'Two spacious "infinity" pools',
      "Private SPA and wellness zone",
      "Water sports center",
      "Landscaped gardens and fountains",
    ],
    dark: false,
    image: "/images/project-details/pd2.jpg",
    imageLeft: false,
  },
  {
    id: "03",
    title: { italic: "Sports", rest: " and Activity" },
    subtitle: "Energy and movement in every space.",
    items: [
      "Fully equipped gym & fitness center",
      "Professional squash court",
      "Table tennis area",
      "Kids' entertainment and play zones",
    ],
    dark: true,
    image: "/images/project-details/pd3.jpg",
    imageLeft: true,
  },
  {
    id: "04",
    title: { italic: "Location", rest: " Highlights" },
    subtitle: "The perfect balance of city and sea.",
    items: [
      "Crescent Island  —  within walking distance",
      "Dream Arena  —  within walking distance",
      "Sea Breeze Casino  —  within walking distance",
      "Baku Airport (GYD)  —  easily accessible",
    ],
    dark: false,
    image: "/images/project-details/pd4.jpg",
    imageLeft: false,
  },
];

export default function ProjectDetails() {
  return (
    <section className="pd-wrapper">
      <PageContainer>
        {/* HEADER */}
        <div className="pd-header">
          <div className="pd-header-left">
            <p className="pd-header-main">
              The project&apos;s architecture is <br className="mobile-br" /> harmoniously complemented by a <br className="mobile-br" /> world-class infrastructure designed to <br className="mobile-br" /> anticipate your every need.
            </p>
            <hr className="pd-divider" />
            <p className="pd-header-sub">
              From high-tech security to <br className="mobile-br" /> premium leisure zones, every <br className="mobile-br" /> technical specification is <br className="mobile-br" /> engineered for absolute comfort and peace of mind.
            </p>
          </div>
          <div className="pd-header-right">
            <h2 className="pd-section-title">
              <span className="po-title-light">Project </span>
              <span className="po-title-bold">Details</span>
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
          {sections.map((sec) => {
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