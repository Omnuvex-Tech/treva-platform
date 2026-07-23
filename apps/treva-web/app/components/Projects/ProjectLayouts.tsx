"use client";

import React from "react";
import Link from "next/link";
import PageContainer from "@/app/components/Container/PageContainer";
import "./unit-layout.css";

interface LayoutItem {
  title: string;
  code: string;
  floor: string;
  number: string;
  price: string;
  slug: string;
  image?: string;
  svgBlueprint?: React.ReactNode;
}

interface Props {
  layouts: LayoutItem[];
  categorySlug?: string;
  locale: string;
  viewAllHref?: string;
}

export default function ProjectLayouts({ layouts, categorySlug, locale, viewAllHref }: Props) {
  const viewAllUrl = viewAllHref || (categorySlug ? `/off-plan?category=${categorySlug}` : "/off-plan");
  const dictionary = {
    az: {
      titleThin: 'Mənzil',
      titleBold: 'planları',
      viewAll: 'Hamısına bax',
    },
    en: {
      titleThin: 'Unit',
      titleBold: 'Layouts',
      viewAll: 'View All',
    },
    ru: {
      titleThin: 'План',
      titleBold: 'ировки',
      viewAll: 'Смотреть все',
    },
  } as const;
  const t = dictionary[(locale as 'az' | 'en' | 'ru')] || dictionary.az;

  return (
    <main className="layouts-section">
      <PageContainer className="pde-page-container">
        <header className="layouts-header">
          <h1 className="layouts-header__title">
            {t.titleThin} <span>{t.titleBold}</span>
          </h1>
          <div className="layouts-controls">
            <a href={viewAllUrl} className="layouts-controls__view-all">{t.viewAll}</a>
          </div>
        </header>

        <div className="layouts-grid">
          {layouts.map((layout, idx) => (
            <Link key={idx} href={`/${locale}/off-plan/${layout.slug}`} className="layout-card layout-card--link">
              <div className="layout-card__header">
                <div className="layout-card__title-block">
                  <span className="layout-card__code">{layout.code}</span>
                  <span className="layout-card__floor">{layout.floor}</span>
                </div>
                <span className="layout-card__number">{layout.number}</span>
              </div>

              <div className="layout-card__visual">
                {layout.image ? (
                  <img
                    src={layout.image}
                    alt={layout.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : layout.svgBlueprint ? (
                  layout.svgBlueprint
                ) : null}
              </div>

              <div className="layout-card__footer">
                <h2 className="layout-card__name">{layout.title}</h2>
                <span className="layout-card__price">{layout.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
