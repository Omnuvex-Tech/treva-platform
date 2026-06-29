'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageContainer from '@/app/components/Container/PageContainer';
import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import { Article } from '@/lib/pulse.types';
import './treva-pulse.css';

const pulseDictionary = {
  az: {
    subtitle: [
      "Daşınmaz əmlak sektoruna dair",
      "bazara təsir edən mühüm hadisələr.",
      "Sürətlə inkişaf edən Bakı bazarının",
      "daxili dinamikasını və ən vacib yeniliklərini izləyin.",
    ],
    filterLabel: "Kateqoriyaya görə",
    categories: { all: "Hamısı" },
    viewAll: "BÜTÜNÜ",
    noData: "Bu kateqoriyada məqalə tapılmadı.",
  },
  en: {
    subtitle: [
      "Your curated source for industry",
      "news, expert insights, and events.",
      "Stay connected to the pulse of",
      "Baku's premium real estate market.",
    ],
    filterLabel: "Filter by category",
    categories: { all: "All" },
    viewAll: "view all",
    noData: "No articles found in this category.",
  },
  ru: {
    subtitle: [
      "Ваш источник новостей, экспертных",
      "мнений и событий. Следите за",
      "динамикой и ключевыми событиями",
      "бакинского рынка элитной недвижимости.",
    ],
    filterLabel: "Фильтр по категории",
    categories: { all: "Все" },
    viewAll: "ВСЕ",
    noData: "В этой категории статей не найдено.",
  },
} as const;

type PulseCategory = { id: string; name: string; slug: string };

type TrevaPulseProps = {
  locale?: string;
  articles?: Article[];
  categories?: PulseCategory[];
};

const TrevaPulse: React.FC<TrevaPulseProps> = ({ locale = 'az', articles = [], categories = [] }) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split('/')[1];
  const activeLocale = (detectedLocale && detectedLocale in pulseDictionary)
    ? detectedLocale as keyof typeof pulseDictionary
    : locale as keyof typeof pulseDictionary;
  const content = pulseDictionary[activeLocale];

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [itemsVisible, setItemsVisible] = useState(3);

  const filteredData = activeFilter === 'all'
    ? [...articles]
    : articles.filter(post => post.category?.toLowerCase() === activeFilter.toLowerCase());

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsVisible(1);
      } else if (window.innerWidth <= 1024) {
        setItemsVisible(2);
      } else {
        setItemsVisible(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let baseData = [...filteredData];
  if (baseData.length > 0) {
    while (baseData.length <= itemsVisible) {
      baseData = [...baseData, ...filteredData];
    }
  }

  const duplicatedData = [...baseData, ...baseData];
  const totalItems = duplicatedData.length;

  const trackWidth = totalItems === 0 ? "100%" : `${(totalItems / itemsVisible) * 100}%`;
  const cardWidth = totalItems === 0 ? "100%" : `${100 / totalItems}%`;

  const scrollSpeed = `${baseData.length * 2}s`;

  return (
    <main>
      <PageContainer>
        <section className="pulse my-10">

          <div className="pulse__header">
            <div className="pulse__desktop-row">
              <h2 className="pulse__title">
                <span className="pulse__title-thin">TREVA</span>{" "}
                <span className="pulse__title-bold">PULSE</span>
              </h2>

              <p className="pulse__subtitle">
                {content.subtitle.map((line, i) => (
                  <React.Fragment key={i}>{line}{i < content.subtitle.length - 1 && <br />}</React.Fragment>
                ))}
              </p>
            </div>

            <div className="pulse__controls-row">
              <div className="pulse__filters">
                <span className="pulse__filter-label">{content.filterLabel}</span>
                <div className="pulse__btn-group">
                  <button
                    type="button"
                    className={`pulse__filter-btn ${activeFilter === 'all' ? 'pulse__filter-btn--active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                    suppressHydrationWarning
                  >
                    {content.categories.all}
                  </button>
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      className={`pulse__filter-btn ${activeFilter === cat.name ? 'pulse__filter-btn--active' : ''}`}
                      onClick={() => setActiveFilter(cat.name)}
                      suppressHydrationWarning
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pulse__view-all-wrapper d-desktop">
                <ViewAllButton label={content.viewAll} href={`/${activeLocale}/pulse`} />
              </div>
            </div>
          </div>

          {/* SLIDER CONTAINER */}
          <div className="pulse__slider-wrapper">
            {totalItems > 0 ? (
              <div
                className="pulse__slider-track"
                style={{
                  width: trackWidth,
                  '--scroll-speed': scrollSpeed
                } as React.CSSProperties}
              >
                {duplicatedData.map((post, index) => (
                  <a
                    href={post.slug ? `/${activeLocale}/pulse/${post.slug}` : `/${activeLocale}/pulse`}
                    key={`${post.slug}-${index}`}
                    className="blog-card"
                    style={{ flex: `0 0 ${cardWidth}`, width: cardWidth }}
                  >
                    <div className="blog-card__inner">
                      <div className="blog-card__img-wrapper">
                        <img src={post.image} alt={post.title} className="blog-card__img" />
                      </div>

                      <div className="blog-card__meta">
                        <span className="blog-card__category">{post.category}</span>
                        <span className="blog-card__date">{post.date}</span>
                      </div>

                      <h3 className="blog-card__title">{post.title}</h3>

                      <div className="blog-card__author">
                        {post.authorImage && (
                          <img src={post.authorImage} alt={post.author ?? ''} className="blog-card__avatar" />
                        )}
                        <span className="blog-card__author-name">{post.author}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="pulse__no-data">{content.noData}</div>
            )}
          </div>

          <div className="pulse__mobile-view-all d-mobile">
            <ViewAllButton mobile label={content.viewAll} href={`/${activeLocale}/pulse`} />
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default TrevaPulse;
