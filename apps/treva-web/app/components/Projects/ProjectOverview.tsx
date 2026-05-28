"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import { ProjectOverviewData } from "@/lib/projects.types";
import "./project-overview.css";

interface Props {
  data: ProjectOverviewData;
}

export default function ProjectOverview({ data }: Props): React.ReactElement {
  return (
    <section className="po-section">
      <PageContainer>
        {/* Header */}
        <div className="po-header">
          <div className="po-title-col">
            <h2 className="po-title">
              <span className="po-title-light">{data.titleLight}</span>
              <span className="po-title-bold">{data.titleBold}</span>
            </h2>
          </div>

          <div className="po-intro-col">
            <p className="po-brand-heading">
              <span className="po-brand-name">{data.brandName}</span>
              <br className="mobile-br" />
              <span className="po-brand-debut">{data.debutText}</span>
              <br className="desktop-br" />
              <span className="po-brand-location">{data.locationText}</span>{" "}
              <span className="po-brand-debut">{data.debutTextEnd}</span>
            </p>

            <div className="po-divider" />

            <p className="po-description">
              {data.description}
            </p>
          </div>
        </div>

        {/* Images Grid */}
        <div className="po-images-grid">
          <div className="po-image-card po-card-large">
            <span className="po-image-label">{data.images.large.label}</span>
            <div className="po-image-wrapper">
              <img
                src={data.images.large.url}
                alt={data.images.large.label}
                className="po-img"
              />
            </div>
          </div>

          <div className="po-image-card po-card-medium">
            <span className="po-image-label">{data.images.medium.label}</span>
            <div className="po-image-wrapper">
              <img
                src={data.images.medium.url}
                alt={data.images.medium.label}
                className="po-img"
              />
            </div>
          </div>

          <div className="po-image-card po-card-small">
            <span className="po-image-label">{data.images.small.label}</span>
            <div className="po-image-wrapper">
              <img
                src={data.images.small.url}
                alt={data.images.small.label}
                className="po-img"
              />
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="po-data-section">
          {data.dataRows.map((row, idx) => (
            <React.Fragment key={idx}>
              <div className="po-data-row">
                <span className="po-data-key">{row.key}</span>
                <span className="po-data-val">{row.value}</span>
              </div>
              {idx < data.dataRows.length - 1 && <hr className="po-data-line" />}
            </React.Fragment>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}