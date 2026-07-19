// 'use client';

// import Image from 'next/image';
// import React, { useEffect, useState } from 'react';
// import { usePathname } from 'next/navigation';
// import PageContainer from '@/app/components/Container/PageContainer';
// import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
// import 'swiper/css';
// import './features-properties.css';

// const arrowSvg = (
//   <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const fallbackCards = [
//   { title: "Marina Village", desc: "Yaxta klubuna sahib olan, tam təhvil verilməyə hazır dəniz mənzərəli fərdi yaşayış sahələri.", brand: "SEA BREEZE" },
//   { title: "Panorama By Elie Saab", desc: "Dünyaşöhrətli dizaynerin imzasını daşıyan, Azərbaycanın ilk rəsmi brend rezidensiyası.", brand: "Reportage." },
//   { title: "Brabus Island", desc: "Tamamilə süni ada üzərində qurulan, fərdi villa və rezidensiyaları ilə özünəməxsus ekstrem estetikasını əks etdirən konsept.", brand: "Reportage." },
//   { title: "Arabian Ranches", desc: "Şərq memarlığının elementləri ilə layihələndirilmiş, geniş şəxsi bağ sahəsi və terrasları olan özəl rezidensiya.", brand: "SEA BREEZE" },
//   { title: "Reportage Heights", desc: "Xəzərin sahilində modern memarlıq və prestijli həyatın birləşdiyi yaşayış kompleksi.", brand: "Reportage." },
//   { title: "Sabah Residence", desc: "Günbəgün artan prestiji lokasiyada dəniz havasına və mərkəzi şəhər dinamikasına malik tamamlanmış layihə.", brand: "SABAH" },
// ];

// const fallbackImages: Record<string, string> = {
//   "reportage-heights": "/images/features-pro/reportage-cover.jpg",
//   "arabian-ranches": "/images/features-pro/arabian-cover.jpg",
//   "marina-village": "/images/features-pro/marina-cover.jpg",
//   "panorama-by-elie-saab": "/images/features-pro/panorama-cover.png",
//   "brabus-island": "/images/features-pro/brabus-cover.jpg",
//   "sabah-residence": "/images/features-pro/sabah-cover.png",
// };

// const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

// const localeStrings = {
//   az: {
//     titleLight: "ÖZƏL SEÇİLMİŞ",
//     titleBold: "DAŞINMAZ ƏMLAKLAR",
//     subtitle: "Portfelimiz şəhərin memarlıq dəyəri və investisiya potensialı yüksək olan strateji nöqtələrini əhatə edir. Biz əsas diqqətimizi zaman keçdikcə sahibinə davamlı kapital artımı qazandıracaq unikal layihələrə yönəldirik.",
//     learnMore: "DAHA ƏTRAFLI",
//     viewAll: "Hamısına bax",
//   },
//   en: {
//     titleLight: "FEATURED",
//     titleBold: "PROPERTIES",
//     subtitle: "Strategic portfolio of the city's top venues. Our focus remains on architectural landmarks and long-term capital growth for investors.",
//     learnMore: "LEARN MORE",
//     viewAll: "View all",
//   },
//   ru: {
//     titleLight: "ИЗБРАННЫЕ",
//     titleBold: "НЕДВИЖИМОСТЬ",
//     subtitle: "Наш портфель охватывает стратегические точки города с высоким архитектурным значением и инвестиционным потенциалом.",
//     learnMore: "ПОДРОБНЕЕ",
//     viewAll: "Смотреть все",
//   },
// };

// type LocalizedValue = string | { az?: string; en?: string; ru?: string };

// function getLocalized(val: LocalizedValue | undefined | null, locale: string, fallback = ""): string {
//   if (!val) return fallback;
//   if (typeof val === "string") return val || fallback;
//   return (val as any)[locale] || val.az || val.en || val.ru || fallback;
// }

// type FeaturedCard = {
//   title: LocalizedValue;
//   desc: LocalizedValue;
//   brand: LocalizedValue;
//   brandImage: string;
//   brandTextColor: string;
//   image: string;
//   slug?: string;
// };

// type FeaturedPropertiesProps = {
//   locale?: string;
// };

// const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ locale = 'az' }) => {
//   const pathname = usePathname();
//   const detectedLocale = pathname?.split("/")[1];
//   const activeLocale = (detectedLocale && detectedLocale in localeStrings) ? detectedLocale as keyof typeof localeStrings : locale as keyof typeof localeStrings;
//   const content = localeStrings[activeLocale];

//   const [cards, setCards] = useState<FeaturedCard[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
//         if (!res.ok) throw new Error("Failed to fetch");
//         const rawData = await res.json();
//         const data = Array.isArray(rawData) ? rawData : rawData.value || [];

//         if (data && data.length > 0) {
//           setCards(data.map((cat: any) => ({
//             title: cat.title,
//             desc: cat.description || "",
//             brand: cat.brand || "",
//             brandImage: cat.brandImage ? (cat.brandImage.startsWith("http") ? cat.brandImage : `${CMS_API}${cat.brandImage}`) : "",
//             brandTextColor: cat.brandTextColor || "white",
//             image: cat.image ? (cat.image.startsWith("http") ? cat.image : `${CMS_API}${cat.image}`) : (fallbackImages[cat.slug] || ""),
//             slug: cat.slug,
//           })));
//         } else {
//           throw new Error("No data");
//         }
//       } catch {
//         const fallbackImagesArray = [
//           "/images/features-pro/marina-cover.jpg",
//           "/images/features-pro/panorama-cover.png",
//           "/images/features-pro/brabus-cover.jpg",
//           "/images/features-pro/arabian-cover.jpg",
//           "/images/features-pro/reportage-cover.jpg",
//           "/images/features-pro/sabah-cover.png",
//         ];
//         setCards(fallbackCards.map((c, i) => ({
//           ...c,
//           brandImage: "",
//           brandTextColor: "white",
//           image: fallbackImagesArray[i] || "",
//         })));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   return (
//     <main>
//       <PageContainer>
//         <section className="featured">

//           {/* DESKTOP HEADER */}
//           <div className="featured__header d-desktop">
//             <div className="featured__desktop-row">
//               <p className="featured__subtitle">
//                 {content.subtitle}
//               </p>
//               <h2 className="featured__title">
//                 <span className="featured__title-featured">{content.titleLight}</span>{" "}
//                 <span className="featured__title-properties">{content.titleBold}</span>
//               </h2>
//             </div>
//             <div className="featured__title-wrapper">
//               <ViewAllButton className="featured__view-all" label={content.viewAll} href={`/${activeLocale}/projects`} />
//             </div>
//           </div>

//           {/* MOBILE HEADER */}
//           <div className="featured__header-mobile d-mobile">
//             <h2 className="featured__title-mobile">
//               <span className="featured__title-mobile-featured">{content.titleLight}</span><br />
//               <span className="featured__title-mobile-properties">{content.titleBold}</span>
//             </h2>
//             <p className="featured__subtitle-mobile">
//               {content.subtitle}
//             </p>
//             <ViewAllButton mobile className="featured__view-all-mobile" label={content.viewAll} href={`/${activeLocale}/projects`} />
//           </div>

//           {/* SLIDER */}
//           <div className="featured__slider-container" style={{ marginBottom: "40px" }}>
//             {cards.length > 0 && (
//               <Swiper
//                 modules={[Autoplay]}
//                 spaceBetween={20}
//                 slidesPerView={1.2}
//                 loop={true}
//                 speed={6000}
//                 autoplay={{
//                   delay: 0,
//                   disableOnInteraction: false,
//                   pauseOnMouseEnter: true,
//                 }}
//                 breakpoints={{
//                   768: { slidesPerView: 2, spaceBetween: 20 },
//                   1024: { slidesPerView: 3, spaceBetween: 20 },
//                   1280: { slidesPerView: 4, spaceBetween: 20 },
//                 }}
//                 className="featured__swiper"
//               >
//                 {cards.slice(0, 6).map((card, i) => (
//                   <SwiperSlide key={card.slug || i} style={{ height: 'auto' }}>
//                     <a
//                       href={card.slug ? `/${activeLocale}/projects/${card.slug}` : "#"}
//                       className="property-card"
//                       style={{ height: '100%' }}
//                     >
//                       {card.image && (
//                         <Image
//                           className="property-card__bg"
//                           src={card.image}
//                           alt={`${getLocalized(card.title, activeLocale)} background`}
//                           fill
//                           sizes="(max-width: 767px) 80vw, (max-width: 1023px) 42vw, (max-width: 1279px) 30vw, 23vw"
//                           priority={i < 2}
//                         />
//                       )}
//                       <div className="property-card__overlay"></div>
                      
//                       {card.brandImage ? (
//                         <img
//                           className="property-card__brand-logo"
//                           src={card.brandImage}
//                           alt={getLocalized(card.brand, activeLocale) || "Brand"}
//                         />
//                       ) : (
//                         <div className="property-card__brand-text" style={{ color: card.brandTextColor === 'black' ? '#000' : '#fff' }}>
//                           {getLocalized(card.brand, activeLocale)}
//                         </div>
//                       )}

//                       {(() => {
//                         const titleText = getLocalized(card.title, activeLocale);
//                         const words = titleText.split(' ');
//                         return (
//                           <h3 className="property-card__title">
//                             {words.length > 2 ? (
//                               <>
//                                 {words.slice(0, Math.ceil(words.length / 2)).join(' ')} <br />
//                                 {words.slice(Math.ceil(words.length / 2)).join(' ')}
//                               </>
//                             ) : (
//                               words.map((word: string, wi: number) => (
//                                 <React.Fragment key={wi}>{word}{wi < words.length - 1 ? <br /> : ''}</React.Fragment>
//                               ))
//                             )}
//                           </h3>
//                         );
//                       })()}
//                       <p className="property-card__desc">{getLocalized(card.desc, activeLocale)}</p>
//                       <span className="property-card__action">
//                         {content.learnMore}
//                         {arrowSvg}
//                       </span>
//                     </a>
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             )}
//           </div>

//         </section>
//       </PageContainer>
//     </main>
//   );
// };

// export default FeaturedProperties;







'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageContainer from '@/app/components/Container/PageContainer';
import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
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

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

const localeStrings = {
  az: {
    titleLight: "ÖZƏL SEÇİLMİŞ",
    titleBold: "DAŞINMAZ ƏMLAKLAR",
    subtitle: "Portfelimiz şəhərin memarlıq dəyəri və investisiya potensialı yüksək olan strateji nöqtələrini əhatə edir. Biz əsas diqqətimizi zaman keçdikcə sahibinə davamlı kapital artımı qazandıracaq unikal layihələrə yönəldirik.",
    learnMore: "DAHA ƏTRAFLI",
    viewAll: "Hamısına bax",
  },
  en: {
    titleLight: "FEATURED",
    titleBold: "PROPERTIES",
    subtitle: "Strategic portfolio of the city's top venues. Our focus remains on architectural landmarks and long-term capital growth for investors.",
    learnMore: "LEARN MORE",
    viewAll: "View all",
  },
  ru: {
    titleLight: "ИЗБРАННЫЕ",
    titleBold: "НЕДВИЖИМОСТЬ",
    subtitle: "Наш портфель охватывает стратегические точки города с высоким архитектурным значением и инвестиционным потенциалом.",
    learnMore: "ПОДРОБНЕЕ",
    viewAll: "Смотреть все",
  },
};

type LocalizedValue = string | { az?: string; en?: string; ru?: string };

function getLocalized(val: LocalizedValue | undefined | null, locale: string, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val || fallback;
  return (val as any)[locale] || val.az || val.en || val.ru || fallback;
}

type FeaturedCard = {
  title: LocalizedValue;
  desc: LocalizedValue;
  brand: LocalizedValue;
  brandImage: string;
  brandTextColor: string;
  image: string;
  slug?: string;
};

type FeaturedPropertiesProps = {
  locale?: string;
};

const SPEED_PX_PER_SEC = 40;      // davamlı sürüşmə sürəti
const RESUME_DELAY = 3000;        // ox basıldıqdan sonra gözləmə (ms)
const STEP_TRANSITION_MS = 500;   // ox ilə keçid animasiyasının müddəti

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ locale = 'az' }) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const activeLocale = (detectedLocale && detectedLocale in localeStrings) ? detectedLocale as keyof typeof localeStrings : locale as keyof typeof localeStrings;
  const content = localeStrings[activeLocale];

  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const stepWidthRef = useRef(0);

  const pausedByHoverRef = useRef(false);
  const pausedByDragRef = useRef(false);
  const pausedByNavRef = useRef(false);
  const isManualRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const suppressClickRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Data fetch ----
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
        if (!res.ok) throw new Error("Failed to fetch");
        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData : rawData.value || [];

        if (data && data.length > 0) {
          setCards(data.map((cat: any) => ({
            title: cat.title,
            desc: cat.description || "",
            brand: cat.brand || "",
            brandImage: cat.brandImage ? (cat.brandImage.startsWith("http") ? cat.brandImage : `${CMS_API}${cat.brandImage}`) : "",
            brandTextColor: cat.brandTextColor || "white",
            image: cat.image ? (cat.image.startsWith("http") ? cat.image : `${CMS_API}${cat.image}`) : (fallbackImages[cat.slug] || ""),
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
      }
    };

    fetchCategories();
  }, []);

  // ---- Ölçmə: bir "set"-in eni və bir kartın addım eni ----
  const measure = useCallback(() => {
    const track = trackRef.current;
    const count = cards.length;
    if (!track || count === 0 || track.children.length < count * 2) return;

    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    const startOfSecondSet = track.children[count] as HTMLElement;

    const r0 = first.getBoundingClientRect();
    const r1 = second.getBoundingClientRect();
    const rSet = startOfSecondSet.getBoundingClientRect();

    stepWidthRef.current = r1.left - r0.left;
    singleSetWidthRef.current = rSet.left - r0.left;

    // İlk yerləşdirmə: ortadakı (2-ci) set-in başlanğıcından başla
    if (offsetRef.current === 0) {
      offsetRef.current = singleSetWidthRef.current;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${offsetRef.current}px)`;
    }
  }, [cards.length]);

  useEffect(() => {
    if (cards.length === 0) return;
    // Şəkillər yüklənənə qədər ölçünü bir neçə dəfə yoxla
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 500);

    const ro = new ResizeObserver(() => measure());
    if (viewportRef.current) ro.observe(viewportRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, [cards.length, measure]);

  // ---- Davamlı animasiya (requestAnimationFrame) ----
  useEffect(() => {
    if (cards.length === 0) return;

    const loop = (timestamp: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = timestamp;
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const singleSetWidth = singleSetWidthRef.current;

      if (
        !pausedByHoverRef.current &&
        !pausedByDragRef.current &&
        !pausedByNavRef.current &&
        !isManualRef.current &&
        singleSetWidth > 0 &&
        trackRef.current
      ) {
        offsetRef.current += (SPEED_PX_PER_SEC * dt) / 1000;

        // Sonsuz dövr üçün "görünməz" wrap (3 dəst kart render olunub)
        if (offsetRef.current >= singleSetWidth * 2) {
          offsetRef.current -= singleSetWidth;
        }

        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [cards.length]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  const clearInteractionTimeouts = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
  }, []);

  const normalizeOffset = useCallback((value: number) => {
    const singleSetWidth = singleSetWidthRef.current;
    if (singleSetWidth <= 0) return value;

    const relative = (((value - singleSetWidth) % singleSetWidth) + singleSetWidth) % singleSetWidth;
    return singleSetWidth + relative;
  }, []);

  const scheduleAutoResume = useCallback(() => {
    resumeTimeoutRef.current = setTimeout(() => {
      resumeTimeoutRef.current = null;
      pausedByNavRef.current = false;
      lastTimeRef.current = null;
    }, RESUME_DELAY);
  }, []);

  const animateToOffset = useCallback((targetOffset: number) => {
    const track = trackRef.current;
    const singleSetWidth = singleSetWidthRef.current;
    if (!track || !singleSetWidth) return;

    pausedByNavRef.current = true;
    isManualRef.current = true;
    clearInteractionTimeouts();

    let currentOffset = offsetRef.current;
    let nextOffset = targetOffset;

    if (nextOffset >= singleSetWidth * 2) {
      currentOffset -= singleSetWidth;
      nextOffset -= singleSetWidth;
    } else if (nextOffset < singleSetWidth) {
      currentOffset += singleSetWidth;
      nextOffset += singleSetWidth;
    }

    offsetRef.current = currentOffset;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${currentOffset}px)`;

    // Force layout so the browser applies the non-animated reposition before animating.
    track.getBoundingClientRect();

    offsetRef.current = nextOffset;
    track.style.transition = `transform ${STEP_TRANSITION_MS}ms ease`;
    track.style.transform = `translateX(-${nextOffset}px)`;

    stepTimeoutRef.current = setTimeout(() => {
      stepTimeoutRef.current = null;
      const nextTrack = trackRef.current;
      if (!nextTrack) return;

      nextTrack.style.transition = 'none';
      offsetRef.current = normalizeOffset(offsetRef.current);
      nextTrack.style.transform = `translateX(-${offsetRef.current}px)`;

      isManualRef.current = false;
      scheduleAutoResume();
    }, STEP_TRANSITION_MS);
  }, [clearInteractionTimeouts, normalizeOffset, scheduleAutoResume]);

  // ---- Hover: DƏRHAL dayan / davam et ----
  const handleMouseEnter = () => {
    pausedByHoverRef.current = true;
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    pausedByHoverRef.current = false;
    lastTimeRef.current = null; // dt sıçrayışının qarşısını al
  };

  // ---- Ox düymələri ----
  const handleNav = (direction: 'prev' | 'next') => {
    const stepWidth = stepWidthRef.current;
    if (!stepWidth) return;

    const target = offsetRef.current + (direction === 'next' ? stepWidth : -stepWidth);
    animateToOffset(target);
  };

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!viewportRef.current || !trackRef.current || !singleSetWidthRef.current) return;

    clearInteractionTimeouts();
    pausedByDragRef.current = true;
    pausedByNavRef.current = true;
    isManualRef.current = true;
    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    offsetRef.current = normalizeOffset(offsetRef.current);
    dragStartOffsetRef.current = offsetRef.current;
    suppressClickRef.current = false;
    trackRef.current.style.transition = 'none';
    trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    viewportRef.current.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }, [clearInteractionTimeouts, normalizeOffset]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId || !trackRef.current) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 6) {
      suppressClickRef.current = true;
    }

    const nextOffset = normalizeOffset(dragStartOffsetRef.current - deltaX);
    offsetRef.current = nextOffset;
    trackRef.current.style.transform = `translateX(-${nextOffset}px)`;
  }, [normalizeOffset]);

  const finishDrag = useCallback((pointerId: number) => {
    const viewport = viewportRef.current;
    if (viewport?.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }

    const dragged = suppressClickRef.current;
    dragPointerIdRef.current = null;
    pausedByDragRef.current = false;
    setIsDragging(false);

    if (!dragged) {
      isManualRef.current = false;
      pausedByNavRef.current = false;
      lastTimeRef.current = null;
      return;
    }

    const stepWidth = stepWidthRef.current;
    const singleSetWidth = singleSetWidthRef.current;
    if (!stepWidth || !singleSetWidth) {
      isManualRef.current = false;
      pausedByNavRef.current = false;
      lastTimeRef.current = null;
      return;
    }

    const snappedOffset =
      singleSetWidth + Math.round((offsetRef.current - singleSetWidth) / stepWidth) * stepWidth;
    animateToOffset(normalizeOffset(snappedOffset));
  }, [animateToOffset, normalizeOffset]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    finishDrag(event.pointerId);
  }, [finishDrag]);

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    finishDrag(event.pointerId);
  }, [finishDrag]);

  const handleViewportClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  // 3 dəst: sonsuz dövr effekti üçün (əvvəl - hazırkı - sonra)
  const renderedCards = cards.length > 0 ? [...cards, ...cards, ...cards] : [];

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
          <div
            className="featured__slider-container"
            style={{ marginBottom: "40px" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {cards.length > 0 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  className="featured__nav-btn featured__nav-btn--prev"
                  onClick={() => handleNav('prev')}
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  className="featured__nav-btn featured__nav-btn--next"
                  onClick={() => handleNav('next')}
                >
                  <ArrowRight size={18} strokeWidth={2} />
                </button>

                <div
                  className={`featured__viewport${isDragging ? ' is-dragging' : ''}`}
                  ref={viewportRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onClickCapture={handleViewportClickCapture}
                  onDragStart={(event) => event.preventDefault()}
                >
                  <div className="featured__track" ref={trackRef}>
                    {renderedCards.map((card, i) => (
                      <a
                        key={`${card.slug || card.title}-${i}`}
                        href={card.slug ? `/${activeLocale}/projects/${card.slug}` : "#"}
                        className="property-card"
                      >
                        {card.image && (
                          <Image
                            className="property-card__bg"
                            src={card.image}
                            alt={`${getLocalized(card.title, activeLocale)} background`}
                            fill
                            draggable={false}
                            sizes="(max-width: 767px) 80vw, (max-width: 1023px) 42vw, (max-width: 1279px) 30vw, 23vw"
                            priority={i < 4}
                          />
                        )}
                        <div className="property-card__overlay"></div>

                        {card.brandImage ? (
                          <img
                            className="property-card__brand-logo"
                            src={card.brandImage}
                            alt={getLocalized(card.brand, activeLocale) || "Brand"}
                            draggable={false}
                          />
                        ) : (
                          <div className="property-card__brand-text" style={{ color: card.brandTextColor === 'black' ? '#000' : '#fff' }}>
                            {getLocalized(card.brand, activeLocale)}
                          </div>
                        )}

                        {(() => {
                          const titleText = getLocalized(card.title, activeLocale);
                          const words = titleText.split(' ');
                          return (
                            <h3 className="property-card__title">
                              {words.length > 2 ? (
                                <>
                                  {words.slice(0, Math.ceil(words.length / 2)).join(' ')} <br />
                                  {words.slice(Math.ceil(words.length / 2)).join(' ')}
                                </>
                              ) : (
                                words.map((word: string, wi: number) => (
                                  <React.Fragment key={wi}>{word}{wi < words.length - 1 ? <br /> : ''}</React.Fragment>
                                ))
                              )}
                            </h3>
                          );
                        })()}
                        <p className="property-card__desc">{getLocalized(card.desc, activeLocale)}</p>
                        <span className="property-card__action">
                          {content.learnMore}
                          {arrowSvg}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default FeaturedProperties;
