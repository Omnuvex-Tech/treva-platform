"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CardImage from "@/app/components/CardImage";
import PageContainer from "@/app/components/Container/PageContainer";
import { getSaved, addSaved, removeSaved } from "@/lib/saved-properties";
import { getCompared, addCompared, removeCompared } from "@/lib/compare-properties";
import "./unit-layout.css";

interface LayoutItem {
  title: string;
  code: string;
  floor: string;
  number: string;
  unitType?: string;
  area?: number;
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
      save: 'Seçilmişlərə əlavə et',
      saved: 'Seçilmişlərdə',
      compare: 'Müqayisəyə əlavə et',
      compared: 'Müqayisədə',
    },
    en: {
      titleThin: 'Unit',
      titleBold: 'Layouts',
      viewAll: 'View All',
      save: 'Add to saved',
      saved: 'Saved',
      compare: 'Add to comparison',
      compared: 'In comparison',
    },
    ru: {
      titleThin: 'План',
      titleBold: 'ировки',
      viewAll: 'Смотреть все',
      save: 'Добавить в избранное',
      saved: 'В избранном',
      compare: 'Добавить к сравнению',
      compared: 'В сравнении',
    },
  } as const;
  const t = dictionary[(locale as 'az' | 'en' | 'ru')] || dictionary.az;

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSaved().map((p) => p.id));
    setComparedIds(getCompared().map((p) => p.id));
  }, []);

  const toggleSave = (layout: LayoutItem) => {
    if (savedIds.includes(layout.slug)) {
      removeSaved(layout.slug);
      setSavedIds((prev) => prev.filter((id) => id !== layout.slug));
    } else {
      addSaved({
        id: layout.slug,
        slug: layout.slug,
        type: 'off-plan',
        image: layout.image || '',
        price: Number(layout.price.replace(/[^\d]/g, '')) || 0,
        currency: 'USD',
        rooms: layout.number,
        area: typeof layout.area === 'number' ? `${layout.area}` : '',
        floor: layout.floor,
        location: layout.title,
        project: layout.title,
        title: layout.code,
      });
      setSavedIds((prev) => [...prev, layout.slug]);
    }
  };

  const toggleCompare = (layout: LayoutItem) => {
    if (comparedIds.includes(layout.slug)) {
      removeCompared(layout.slug);
      setComparedIds((prev) => prev.filter((id) => id !== layout.slug));
    } else {
      addCompared({
        id: layout.slug,
        slug: layout.slug,
        type: 'off-plan',
        image: layout.image || '',
        price: Number(layout.price.replace(/[^\d]/g, '')) || 0,
        currency: 'USD',
        rooms: layout.number,
        area: typeof layout.area === 'number' ? `${layout.area}` : '',
        floor: layout.floor,
        project: layout.title,
        title: layout.code,
      });
      setComparedIds((prev) => [...prev, layout.slug]);
    }
  };

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
            <div key={idx} className="layout-card-wrap">
              <Link href={`/${locale}/off-plan/${layout.slug}`} className="layout-card layout-card--link">
                <div className="layout-card__header">
                  <div className="layout-card__title-block">
                    <span className="layout-card__code">{layout.code}</span>
                    <span className="layout-card__meta-row">
                      <span className="layout-card__floor">{layout.floor}</span>
                      <span className="layout-card__meta-sep">•</span>
                      <span className="layout-card__number">{layout.number}</span>
                    </span>
                  </div>
                </div>

                <div className="layout-card__visual">
                  {layout.image ? (
                    <CardImage
                      src={layout.image}
                      alt={layout.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 360px"
                      style={{ objectFit: "contain" }}
                    />
                  ) : layout.svgBlueprint ? (
                    layout.svgBlueprint
                  ) : null}
                </div>

                <div className="layout-card__footer">
                  <div className="layout-card__meta">
                    {layout.unitType ? <span>{layout.unitType}</span> : null}
                    {layout.unitType ? <span className="layout-card__meta-sep">•</span> : null}
                    {typeof layout.area === "number" ? <span>{layout.area} m²</span> : null}
                  </div>
                  <span className="layout-card__price">{layout.price}</span>
                </div>
              </Link>

              <div className="layout-card__actions">
                <button
                  type="button"
                  className={`layout-card__action-btn${comparedIds.includes(layout.slug) ? " active" : ""}`}
                  aria-label={comparedIds.includes(layout.slug) ? t.compared : t.compare}
                  onClick={() => toggleCompare(layout)}
                >
                  <img src="/images/icons/compare.svg" alt="" width={20} height={20} />
                </button>
                <button
                  type="button"
                  className={`layout-card__action-btn${savedIds.includes(layout.slug) ? " active" : ""}`}
                  aria-label={savedIds.includes(layout.slug) ? t.saved : t.save}
                  onClick={() => toggleSave(layout)}
                >
                  <img src="/images/icons/heart.svg" alt="" width={20} height={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
