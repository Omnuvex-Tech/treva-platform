'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageContainer from '@/app/components/Container/PageContainer';
import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import './treva-pulse.css';

type BlogEntry = {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  author: string;
  avatar: string;
};

const pulseDictionary = {
  az: {
    subtitle: [
      "Daşınmaz əmlak sektoruna dair",
      "bazara təsir edən mühüm hadisələr.",
      "Sürətlə inkişaf edən Bakı bazarının",
      "daxili dinamikasını və ən vacib yeniliklərini izləyin.",
    ],
    filterLabel: "Kateqoriyaya görə",
    categories: { all: "Hamısı", events: "Tədbirlər", blog: "Bloq", highlights: "Seçilmişlər" },
    viewAll: "BÜTÜNÜ",
    noData: "Bu kateqoriyada məqalə tapılmadı.",
    blogs: [
      { id: 1, title: "Niyə bəzi daşınmaz əmlak layihələri bazarı qabaqlayır?", category: "Bloq", date: "29.04.2026", image: "/images/treva-pulse/tp1.png", author: "Tural Najafov", avatar: "/images/treva-pulse/tural-najafov.png" },
      { id: 2, title: "Bakıda mənzil qiymətləri 2026: Ən yaxşı layihələr", category: "Bloq", date: "23.04.2026", image: "/images/treva-pulse/tp2.png", author: "Leyla Baghirzada", avatar: "/images/treva-pulse/leyla-bagirzade.png" },
      { id: 3, title: "Bakı daşınmaz əmlakını peşəkar satışla mənimsəyin.", category: "Bloq", date: "17.04.2026", image: "/images/treva-pulse/tp3.png", author: "Javid Akhundov", avatar: "/images/treva-pulse/cavid-axundov.png" },
      { id: 4, title: "Mənzil üçün neçə qədər ilkin ödəniş etmək lazımdır?", category: "Bloq", date: "08.05.2026", image: "/images/treva-pulse/tp4.png", author: "Emil Gurbanov", avatar: "/images/treva-pulse/emil-qurbanov.png" },
    ] as BlogEntry[],
  },
  en: {
    subtitle: [
      "Your curated source for industry",
      "news, expert insights, and events.",
      "Stay connected to the pulse of",
      "Baku's premium real estate market.",
    ],
    filterLabel: "Filter by category",
    categories: { all: "All", events: "Events", blog: "Blog", highlights: "Highlights" },
    viewAll: "vIew all",
    noData: "No articles found in this category.",
    blogs: [
      { id: 1, title: "Why Some Developers Outpace the Market?", category: "BLOG", date: "29.04.2026", image: "/images/treva-pulse/tp1.png", author: "Tural Najafov", avatar: "/images/treva-pulse/tural-najafov.png" },
      { id: 2, title: "Apartment Prices in Baku 2026: Best Value Projects", category: "BLOG", date: "23.04.2026", image: "/images/treva-pulse/tp2.png", author: "Leyla Baghirzada", avatar: "/images/treva-pulse/leyla-bagirzade.png" },
      { id: 3, title: "Mastering Baku's Real Estate Through Professional Sales.", category: "BLOG", date: "17.04.2026", image: "/images/treva-pulse/tp3.png", author: "Javid Akhundov", avatar: "/images/treva-pulse/cavid-axundov.png" },
      { id: 4, title: "How Much to Downpay for an Apartment?", category: "BLOG", date: "08.05.2026", image: "/images/treva-pulse/tp4.png", author: "Emil Gurbanov", avatar: "/images/treva-pulse/emil-qurbanov.png" },
    ] as BlogEntry[],
  },
  ru: {
    subtitle: [
      "Ваш источник новостей, экспертных",
      "мнений и событий. Следите за",
      "динамикой и ключевыми событиями",
      "бакинского рынка элитной недвижимости.",
    ],
    filterLabel: "Фильтр по категории",
    categories: { all: "Все", events: "События", blog: "Блог", highlights: "Избранное" },
    viewAll: "ВСЕ",
    noData: "В этой категории статей не найдено.",
    blogs: [
      { id: 1, title: "Почему некоторые девелоперы опережают рынок?", category: "БЛОГ", date: "29.04.2026", image: "/images/treva-pulse/tp1.png", author: "Tural Najafov", avatar: "/images/treva-pulse/tural-najafov.png" },
      { id: 2, title: "Цены на квартиры в Баку 2026: Лучшие проекты", category: "БЛОГ", date: "23.04.2026", image: "/images/treva-pulse/tp2.png", author: "Leyla Baghirzada", avatar: "/images/treva-pulse/leyla-bagirzade.png" },
      { id: 3, title: "Освойте бакинскую недвижимость через профессиональные продажи.", category: "БЛОГ", date: "17.04.2026", image: "/images/treva-pulse/tp3.png", author: "Javid Akhundov", avatar: "/images/treva-pulse/cavid-axundov.png" },
      { id: 4, title: "Сколько нужно внести за квартиру?", category: "БЛОГ", date: "08.05.2026", image: "/images/treva-pulse/tp4.png", author: "Emil Gurbanov", avatar: "/images/treva-pulse/emil-qurbanov.png" },
    ] as BlogEntry[],
  },
} as const;

type CategoryKey = keyof typeof pulseDictionary.az.categories;

type PulseFilterButtonProps = {
  label: string;
  isActive: boolean;
  onClick: (key: CategoryKey) => void;
  categoryKey: CategoryKey;
};

function PulseFilterButton({ label, isActive, onClick, categoryKey }: PulseFilterButtonProps) {
  return (
    <button
      type="button"
      className={`pulse__filter-btn ${isActive ? 'pulse__filter-btn--active' : ''}`}
      onClick={() => onClick(categoryKey)}
      suppressHydrationWarning
    >
      {label}
    </button>
  );
}

type TrevaPulseProps = {
  locale?: string;
};

const TrevaPulse: React.FC<TrevaPulseProps> = ({ locale = 'az' }) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split('/')[1];
  const activeLocale = (detectedLocale && detectedLocale in pulseDictionary)
    ? detectedLocale as keyof typeof pulseDictionary
    : locale as keyof typeof pulseDictionary;
  const content = pulseDictionary[activeLocale];

  const [activeFilter, setActiveFilter] = useState<CategoryKey>('blog');
  const [itemsVisible, setItemsVisible] = useState(3);

  const categoryKeys: CategoryKey[] = ['all', 'events', 'blog', 'highlights'];

  const filteredData = activeFilter === 'all'
    ? [...content.blogs]
    : content.blogs.filter(post => {
        const categoryMap: Record<CategoryKey, string> = {
          all: '',
          events: 'Tədbir',
          blog: content.categories.blog,
          highlights: 'Highlight',
        };
        return post.category.toLowerCase() === categoryMap[activeFilter].toLowerCase();
      });

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
                  {categoryKeys.map((key) => (
                    <PulseFilterButton
                      key={key}
                      categoryKey={key}
                      label={content.categories[key]}
                      isActive={activeFilter === key}
                      onClick={setActiveFilter}
                    />
                  ))}
                </div>
              </div>

              <div className="pulse__view-all-wrapper d-desktop">
                <ViewAllButton label={content.viewAll} />
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
                    href="#"
                    key={`${post.id}-${index}`}
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
                        <img src={post.avatar} alt={post.author} className="blog-card__avatar" />
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
            <ViewAllButton mobile label={content.viewAll} />
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default TrevaPulse;