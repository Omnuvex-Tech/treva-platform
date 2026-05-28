"use client";

import React from "react";
import { DirectionButton } from "@/app/components/Buttons/PortfolioButtons";
import { ProjectLayoutData } from "@/lib/projects.types";
import PageContainer from "@/app/components/Container/PageContainer";
import "./unit-layout.css";

interface Props {
  layouts: ProjectLayoutData[];
}

export default function ProjectLayouts({ layouts }: Props) {
  return (
    <main className="layouts-section">
      <PageContainer>
      {/* Header Controls */}
      <header className="layouts-header">
        <h1 className="layouts-header__title">
          Unit <span>Layouts</span>
        </h1>
        
        <div className="layouts-controls">
          <nav className="layouts-controls__nav" aria-label="Carousel Navigation">
            <DirectionButton direction="previous" label="Previous layout" />
            <DirectionButton direction="next" label="Next layout" />
          </nav>
          <button className="layouts-controls__view-all">View All</button>
        </div>
      </header>

      {/* Layouts Grid */}
      <div className="layouts-grid">
        {layouts.map((layout, idx) => (
          <article key={idx} className="layout-card">
            <div className="layout-card__header">
              <div className="layout-card__title-block">
                <span className="layout-card__code">{layout.code}</span>
                <span className="layout-card__floor">{layout.floor}</span>
              </div>
              <span className="layout-card__number">{layout.number}</span>
            </div>
            
            <div className="layout-card__visual">
              {layout.svgBlueprint}
            </div>

            <div className="layout-card__footer">
              <h2 className="layout-card__name">{layout.title}</h2>
              <span className="layout-card__price">{layout.price}</span>
            </div>
          </article>
        ))}
      </div>
      </PageContainer>
    </main>
  );
}
