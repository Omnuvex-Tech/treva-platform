'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageContainer from '@/app/components/Container/PageContainer';
import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import './features-properties.css';

const arrowSvg = (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const fallbackCards = [
  { title: "Marina Village", desc: "Yaxta klubuna sahib olan, tam təhvil verilməyə hazır dəniz mənzərəli fərdi yaşayış sahələri.", brand: "SEA BREEZE" },
  { title: "Panorama By Elie Saab", desc: "Dünyaşöhrətli dizaynerin imzasını daşıyan, Azərbaycanın ilk rəsmi brend rezidensiyası.", brand: "Reportage." },
  { title: "Brabus Island", desc: "Tamamilə süni ada üzərində qurulan, fərdi villa və rezidensiyaları ilə özünəməxsus ekstrem estetikasını əks etdirən konsept.", brand: "Reportage." },
  { title: "Arabian Ranches", desc: "Şərq memarlığının elementləri ilə layihələndirilmiş, geniş şəxsi bağ sahəsi və terrasları olan özəl rezidensiya.", brand: "SEA BREEZE" },
  { title: "Reportage Heights", desc: "Xəzərin sahilində modern memarlıq və prestijli həyatın birləşdiyi yaşayış kompleksi.", brand: "Reportage." },
  { title: "Sabah Residence", desc: "Günbəgün artan prestiji lokasiyada dəniz havasına və mərkəzi şəhər dinamikasına malik tamamlanmış layihə.", brand: "SABAH" },
];

const fallbackImages: Record<string, string> = {
  "reportage-heights": "/images/features-pro/reportage-cover.jpg",
  "arabian-ranches": "/images/features-pro/arabian-cover.jpg",
  "marina-village": "/images/features-pro/marina-cover.jpg",
  "panorama-by-elie-saab": "/images/features-pro/panorama-cover.png",
  "brabus-island": "/images/features-pro/brabus-cover.jpg",
  "sabah-residence": "/images/features-pro/sabah-cover.png",
};

const localeStrings = {
  az: {
    titleLight: "ÖZƏL SEÇİLMİŞ",
    titleBold: "DAŞINMAZ ƏMLAKLAR",
    subtitle: "Portfelimiz şəhərin memarlıq dəyəri və investisiya potensialı yüksək olan strateji nöqtələrini əhatə edir. Biz əsas diqqətimizi zaman keçdikcə sahibinə davamlı kapital artımı qazandıracaq unikal layihələrə yönəldirik.",
    learnMore: "DAHA ƏTRAFLI",
    viewAll: "BÜTÜNÜ",
  },
  en: {
    titleLight: "FEATURED",
    titleBold: "PROPERTIES",
    subtitle: "Strategic portfolio of the city's top venues. Our focus remains on architectural landmarks and long-term capital growth for investors.",
    learnMore: "LEARN MORE",
    viewAll: "VIEW ALL",
  },
  ru: {
    titleLight: "ИЗБРАННЫЕ",
    titleBold: "НЕДВИЖИМОСТЬ",
    subtitle: "Наш портфель охватывает стратегические точки города с высоким архитектурным значением и инвестиционным потенциалом.",
    learnMore: "ПОДРОБНЕЕ",
    viewAll: "ВСЕ",
  },
};

type FeaturedCard = {
  title: string;
  desc: string;
  brand: string;
  brandImage: string;
  brandTextColor: string;
  image: string;
  slug?: string;
};

type FeaturedPropertiesProps = {
  locale?: string;
};

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ locale = 'az' }) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const activeLocale = (detectedLocale && detectedLocale in localeStrings) ? detectedLocale as keyof typeof localeStrings : locale as keyof typeof localeStrings;
  const content = localeStrings[activeLocale];

  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
        const res = await fetch(`${trevaApiUrl}/categories/featured`);
        if (!res.ok) throw new Error("Failed to fetch");
        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData : rawData.value || [];

        if (data && data.length > 0) {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";
          setCards(data.map((cat: any) => ({
            title: cat.title,
            desc: cat.description || "",
            brand: cat.brand || "",
            brandImage: cat.brandImage ? (cat.brandImage.startsWith("http") ? cat.brandImage : `${apiUrl}${cat.brandImage}`) : "",
            brandTextColor: cat.brandTextColor || "white",
            image: cat.image ? (cat.image.startsWith("http") ? cat.image : `${apiUrl}${cat.image}`) : (fallbackImages[cat.slug] || ""),
            slug: cat.slug,
          })));
        } else {
          throw new Error("No data");
        }
      } catch {
        const fallbackImagesArray = [
          "/images/features-pro/marina-cover.jpg",
          "/images/features-pro/panorama-cover.png",
          "/images/features-pro/brabus-cover.jpg",
          "/images/features-pro/arabian-cover.jpg",
          "/images/features-pro/reportage-cover.jpg",
          "/images/features-pro/sabah-cover.png",
        ];
        setCards(fallbackCards.map((c, i) => ({
          ...c,
          brandImage: "",
          brandTextColor: "white",
          image: fallbackImagesArray[i] || "",
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <main>
      <PageContainer>
        <section className="featured">

          {/* DESKTOP HEADER */}
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
              <ViewAllButton className="featured__view-all" label={content.viewAll} href={`/${activeLocale}/projects`} />
            </div>
          </div>

          {/* MOBILE HEADER */}
          <div className="featured__header-mobile d-mobile">
            <h2 className="featured__title-mobile">
              <span className="featured__title-mobile-featured">{content.titleLight}</span><br />
              <span className="featured__title-mobile-properties">{content.titleBold}</span>
            </h2>
            <p className="featured__subtitle-mobile">
              {content.subtitle}
            </p>
            <ViewAllButton mobile className="featured__view-all-mobile" label={content.viewAll} href={`/${activeLocale}/projects`} />
          </div>

          {/* SLIDER */}
          <div className="featured__slider-container" style={{ marginBottom: "40px" }}>
            {cards.length > 0 && (
              <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={1.2}
                loop={true}
                speed={6000}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                breakpoints={{
                  768: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 20 },
                  1280: { slidesPerView: 4, spaceBetween: 20 },
                }}
                className="featured__swiper"
              >
                {cards.slice(0, 6).map((card, i) => (
                  <SwiperSlide key={card.slug || i} style={{ height: 'auto' }}>
                    <a
                      href={card.slug ? `/${activeLocale}/projects/${card.slug}` : "#"}
                      className={`property-card${i === 3 ? ' property-card--highlighted' : ''}`}
                      style={{ height: '100%' }}
                    >
                      {card.image && (
                        <img
                          className="property-card__bg"
                          src={card.image}
                          alt={`${card.title} background`}
                        />
                      )}
                      <div className="property-card__overlay"></div>
                      
                      {card.brandImage ? (
                        <img
                          className="property-card__brand-logo"
                          src={card.brandImage}
                          alt={card.brand || "Brand"}
                        />
                      ) : (
                        <div className="property-card__brand-text" style={{ color: card.brandTextColor === 'black' ? '#000' : '#fff' }}>
                          {card.brand}
                        </div>
                      )}

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
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default FeaturedProperties;
