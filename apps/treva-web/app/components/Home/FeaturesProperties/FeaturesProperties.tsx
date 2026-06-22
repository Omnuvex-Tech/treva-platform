'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PageContainer from '@/app/components/Container/PageContainer';
import { DirectionButton, ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import './features-properties.css';

const arrowSvg = (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const featuredDictionary = {
  az: {
    titleLight: "ÖZƏL SEÇİLMİŞ",
    titleBold: "DAŞINMAZ ƏMLAKLAR",
    subtitle: "Portfelimiz şəhərin memarlıq dəyəri və investisiya potensialı yüksək olan strateji nöqtələrini əhatə edir. Biz əsas diqqətimizi zaman keçdikcə sahibinə davamlı kapital artımı qazandıracaq unikal layihələrə yönəldirik.",
    learnMore: "DAHA ƏTRAFLI",
    viewAll: "BÜTÜNÜ",
    prevAria: "Əvvəlki layihə",
    nextAria: "Növbəti layihə",
    cards: [
      {
        title: "Marina Village",
        desc: "Yaxta klubuna sahib olan, tam təhvil verilməyə hazır dəniz mənzərəli fərdi yaşayış sahələri.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
      {
        title: "Panorama By Elie Saab",
        desc: "Dünyaşöhrətli dizaynerin imzasını daşıyan, Azərbaycanın ilk rəsmi brend rezidensiyası.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Brabus Island",
        desc: "Tamamilə süni ada üzərində qurulan, fərdi villa və rezidensiyaları ilə özünəməxsus ekstrim estetikasını əks etdirən konsept.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Arabian Ranches",
        desc: "Şərq memarlığının elementləri ilə layihələndirilmiş, geniş şəxsi bağ sahəsi və terrasları olan özəl rezidensiya.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
    ],
  },
  en: {
    titleLight: "FEATURED",
    titleBold: "PROPERTIES",
    subtitle: "Strategic portfolio of the city's top venues. Our focus remains on architectural landmarks and long-term capital growth for investors.",
    learnMore: "LEARN MORE",
    viewAll: "VIEW ALL",
    prevAria: "Previous property",
    nextAria: "Next property",
    cards: [
      {
        title: "Marina Village",
        desc: "Sea-view private residences with yacht club ownership, delivered move-in ready.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
      {
        title: "Panorama By Elie Saab",
        desc: "Azerbaijan's first official branded residence, bearing the signature of a world-renowned designer.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Brabus Island",
        desc: "A concept built entirely on an artificial island, reflecting extreme aesthetics through private villas and residences.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Arabian Ranches",
        desc: "A private residence designed with elements of Eastern architecture, featuring spacious private gardens and terraces.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
    ],
  },
  ru: {
    titleLight: "ИЗБРАННЫЕ",
    titleBold: "НЕДВИЖИМОСТЬ",
    subtitle: "Наш портфель охватывает стратегические точки города с высоким архитектурным значением и инвестиционным потенциалом. Мы сосредоточены на уникальных проектах, обеспечивающих устойчивый рост капитала.",
    learnMore: "ПОДРОБНЕЕ",
    viewAll: "ВСЕ",
    prevAria: "Предыдущий проект",
    nextAria: "Следующий проект",
    cards: [
      {
        title: "Marina Village",
        desc: "Приватные резиденции с видом на море и яхт-клубом, готовые к заселению.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
      {
        title: "Panorama By Elie Saab",
        desc: "Первая официальная бренд-резиденция Азербайджана, созданная всемирно известным дизайнером.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Brabus Island",
        desc: "Концепция, полностью построенная на искусственном острове, отражающая экстремальную эстетику через приватные виллы и резиденции.",
        brand: "Reportage." as const,
        brandSub: "Properties" as const,
        brandClass: "brand-reportage" as const,
      },
      {
        title: "Arabian Ranches",
        desc: "Частная резиденция, спроектированная в элементах восточной архитектуры, с просторными частными садами и террасами.",
        brand: "SEA BREEZE" as const,
        brandSub: "REAL ESTATE" as const,
        brandClass: "brand-seabreeze" as const,
      },
    ],
  },
} as const;

const cardImages = [
  "/images/features-pro/feat1.jpg",
  "/images/features-pro/feat2.jpg",
  "/images/features-pro/feat3.jpg",
  "/images/features-pro/feat4.jpg",
];

type FeaturedPropertiesProps = {
  locale?: string;
};

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ locale = 'az' }) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const activeLocale = (detectedLocale && detectedLocale in featuredDictionary) ? detectedLocale as keyof typeof featuredDictionary : locale as keyof typeof featuredDictionary;
  const content = featuredDictionary[activeLocale];

  return (
    <main>
      <PageContainer>
        <section className="featured">
          
          {/* ========================================================
              1. DESKTOP HEADER (Vahid sətir, mərkəzləşdirilmiş hiza)
             ======================================================== */}
          <div className="featured__header d-desktop">
            <div className="featured__desktop-row">
              <p className="featured__subtitle">
                {content.subtitle}
              </p>

              <h2 className="featured__title">
                <span className="featured__title-featured">{content.titleLight}</span>{" "}
                <span className="featured__title-properties">{content.titleBold}</span>
              </h2>
            </div>

            <div className="featured__title-wrapper">
              <ViewAllButton className="featured__view-all" label={content.viewAll} />
            </div>
          </div>


          {/* ========================================================
              2. MOBİL HEADER
             ======================================================== */}
          <div className="featured__header-mobile d-mobile">
            <h2 className="featured__title-mobile">
              <span className="featured__title-mobile-featured">{content.titleLight}</span><br />
              <span className="featured__title-mobile-properties">{content.titleBold}</span>
            </h2>

            <p className="featured__subtitle-mobile">
              {content.subtitle}
            </p>

            <ViewAllButton mobile className="featured__view-all-mobile" label={content.viewAll} />
          </div>


          {/* ========================================================
              3. SLIDER & CARDS GRID (Yenilənmiş Mətn Tipli Loqolar)
             ======================================================== */}
          <div className="featured__slider-container">
            <div className="featured__grid">
              {content.cards.map((card, i) => (
                <a
                  key={i}
                  href="#"
                  className={`property-card${i === 3 ? ' property-card--highlighted' : ''}`}
                >
                  <img
                    className="property-card__bg"
                    src={cardImages[i]}
                    alt={`${card.title} background`}
                  />
                  <div className="property-card__overlay"></div>

                  <div className={`property-card__brand-text ${card.brandClass}`}>
                    {card.brand}
                    <span>{card.brandSub}</span>
                  </div>

                  <h3 className="property-card__title">
                    {card.title.split(' ').length > 2 ? (
                      <>
                        {card.title.split(' ').slice(0, Math.ceil(card.title.split(' ').length / 2)).join(' ')} <br />
                        {card.title.split(' ').slice(Math.ceil(card.title.split(' ').length / 2)).join(' ')}
                      </>
                    ) : (
                      card.title.split(' ').map((word, wi) => (
                        <React.Fragment key={wi}>{word}{wi < card.title.split(' ').length - 1 ? <br /> : ''}</React.Fragment>
                      ))
                    )}
                  </h3>

                  <p className="property-card__desc">{card.desc}</p>

                  <span className="property-card__action">
                    {content.learnMore}
                    {arrowSvg}
                  </span>
                </a>
              ))}
            </div>

            {/* Slider Naviqasiya Oxları */}
            <div className="featured__controls">
              <DirectionButton direction="previous" label={content.prevAria} />
              <DirectionButton direction="next" label={content.nextAria} />
            </div>
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default FeaturedProperties;
