"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import "./project-overview.css";

export default function ProjectOverview(): React.ReactElement {
  return (
    <section className="po-section">
      <PageContainer>
        {/* ────── Header (Başlıq və Təsvir hissəsi) ────── */}
        <div className="po-header">
          <div className="po-title-col">
            <h2 className="po-title">
              <span className="po-title-light">Project </span>
              <span className="po-title-bold">Overview</span>
            </h2>
          </div>

          <div className="po-intro-col">
            <p className="po-brand-heading">
              <span className="po-brand-name">Panorama by ELIE SAAB</span>
              <br className="mobile-br" />
              <span className="po-brand-debut"> marks the debut of </span>
              <br className="desktop-br" />
              <span className="po-brand-debut">Azerbaijan&apos;s first </span>
              <br className="mobile-br" />
              <span className="po-brand-location">branded residences</span>{" "}
              <span className="po-brand-debut">at Sea Breeze.</span>
            </p>

            <div className="po-divider" />

            <p className="po-description">
              This landmark project translates <br className="mobile-br" />
              the legendary designer's <br className="desktop-br" />
              "timeless <br className="mobile-br" />
              elegance" from Haute Couture <br className="mobile-br" />
              into exclusive <br className="desktop-br" />
              coastal living. Every <br className="mobile-br" />
              detail is meticulously crafted to <br className="desktop-br" />
              <br className="mobile-br" />
              define a new global standard of <br className="mobile-br" />
              sophisticated lifestyle.
            </p>
          </div>
        </div>

        {/* ────── Images Grid (Şəkillər şəbəkəsi) ────── */}
        <div className="po-images-grid">
          <div className="po-image-card po-card-large">
            <span className="po-image-label">Modern architecture of buildings</span>
            <div className="po-image-wrapper">
              <img
                src="/images/project-overview/po1.jpg"
                alt="Modern architecture of buildings"
                className="po-img"
              />
            </div>
          </div>

          <div className="po-image-card po-card-medium">
            <span className="po-image-label">Elegant living</span>
            <div className="po-image-wrapper">
              <img
                src="/images/project-overview/po2.jpg"
                alt="Elegant living"
                className="po-img"
              />
            </div>
          </div>

          <div className="po-image-card po-card-small">
            <span className="po-image-label">Incredible view</span>
            <div className="po-image-wrapper">
              <img
                src="/images/project-overview/po3.jpg"
                alt="Incredible view"
                className="po-img"
              />
            </div>
          </div>
        </div>

        {/* ────── Data Rows (Məlumat sətirləri) ────── */}
        <div className="po-data-section">
          <div className="po-data-row">
            <span className="po-data-key">Project Type</span>
            <span className="po-data-val">Residential complex</span>
          </div>
          <hr className="po-data-line" />

          <div className="po-data-row">
            <span className="po-data-key">Year of Completion</span>
            <span className="po-data-val">2030</span>
          </div>
          <hr className="po-data-line" />

          <div className="po-data-row">
            <span className="po-data-key">Price Range</span>
            <span className="po-data-val">
              MIN &mdash; 188 874 USD,<br className="mobile-br" />&nbsp;&nbsp;MAX &mdash; 849 849 USD
            </span>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}