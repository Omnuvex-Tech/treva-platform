"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./styles/home.css";
import { Swiper } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { ButtonText } from '@/app/components/ButtonText';
import PageContainer from '@/app/components/Container/PageContainer';

// Production-parity CSS overrides including the new layout typography
const productionStyles = `
  @font-face {
    font-family: Helveticanowdisplay;
    src: url(https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68908bd9d6a08ad4a2ee21dc_HelveticaNowDisplay-Regular.ttf) format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  /* Intro Section Desktop Grid Layout */
  .section_logos .logos_intro {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 40px !important;
    align-items: flex-start !important;
    margin-bottom: 63px !important;
    width: 100% !important;
  }

  /* Left Paragraph Style */
  .logos-left-description {
    font-family: Helveticanowdisplay, sans-serif !important;
    font-size: 18px !important;
    font-weight: 300 !important;
    line-height: 1.4 !important;
    color: rgba(255, 255, 255, 0.6) !important;
    text-transform: none !important;
    margin: 0 !important;
    max-width: 450px !important;
    letter-spacing: 0.3px;
    text-align: left !important;
    order: 1 !important;
  }

  /* Right Heading Style */
  .logos-right-heading {
    font-family: 'Oak Sans', sans-serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
    font-size: 53px !important;
    line-height: 100% !important;
    letter-spacing: -0.03em !important;
    text-transform: uppercase !important;
    color: #ffffff !important;
    margin: 0 !important;
    text-align: left !important;
    order: 2 !important;
  }
  
  .text-color-white60 {
    color: rgba(255, 255, 255, 0.6) !important;
  }
  
  .n-testimonials_quote {
    font-family: Helveticanowdisplay, sans-serif !important;
    letter-spacing: -0.04em !important;
    max-width: 644px !important;
    font-size: 28px !important;
    font-weight: 500 !important;
    line-height: 1.1 !important;
    color: #fff !important;
    text-transform: uppercase !important;
  }
  
  .n-testimonials_author-wrap {
    font-family: Helveticanowdisplay, sans-serif !important;
    grid-column-gap: 10px !important;
    grid-row-gap: 10px !important;
    justify-content: flex-start !important;
    align-items: center !important;
    display: flex !important;
    color: #fff !important;
    font-size: 14px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
  }

  @media screen and (min-width: 992px) {
    .home-logos-note-text {
      font-size: 14.5px !important;
    }
  }

  .n-testimonials_card {
    grid-column-gap: 43.75px !important;
    grid-row-gap: 43.75px !important;
    flex-flow: column !important;
    justify-content: center !important;
    align-items: flex-start !important;
    height: 100% !important;
    padding: 70px 38.5px 45.5px 63px !important;
    display: flex !important;
    transition: none !important;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .n-testimonials_card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .logos_cell:hover .logos_img-wrap {
    transform: none !important;
  }

  .logos_cell-decoration .icon-large svg {
    transition: none !important;
  }

  .logos_cell:hover .logos_cell-decoration .icon-large svg {
    opacity: 1 !important;
    transform: none !important;
  }

  .swiper-nav-testimonials {
    display: flex !important;
    align-items: center !important;
    gap: 16.8px !important;
    position: absolute !important;
    right: 63px !important;
    bottom: 45.5px !important;
    z-index: 10 !important;
  }

  .swiper-testimonials-prev, .swiper-testimonials-next {
    cursor: pointer !important;
    transition: opacity 0.3s ease !important;
  }

  .swiper-testimonials-prev:hover, .swiper-testimonials-next:hover {
    opacity: 0.6 !important;
  }

  .heading-gap-h1 {
    display: none !important;
  }

  .section_logos .logos-partnership-button {
    grid-column-gap: 5px !important;
    grid-row-gap: 5px !important;
    border: 1px solid var(--_color---white) !important;
    background-color: var(--_color---white) !important;
    color: #565a63 !important;
    white-space: nowrap !important;
    border-radius: 80px !important;
    justify-content: center !important;
    align-items: center !important;
    box-sizing: border-box !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 29px !important;
    min-height: 29px !important;
    padding: 0 17px !important;
    font-size: 14px !important;
    line-height: 17px !important;
    text-decoration: none !important;
    transition: all .3s !important;
    display: flex !important;
    flex: none !important;
    overflow: hidden !important;
  }

  .section_logos .logos-partnership-button:hover {
    color: var(--_color---white) !important;
    background-color: transparent !important;
    border-color: var(--_color---white) !important;
  }

  .logos-left-description-mobile {
    display: none !important;
  }

  /* ==========================================================================
     RESPONSIVE MOBIL STILLƏR (DƏYİŞİKLİKLƏR YALNIZ MOBİLDƏ)
     ========================================================================== */
  @media screen and (max-width: 991px) {
    .section_logos .logos_intro {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 36px !important; 
      margin-bottom: 40px !important;
    }

    .logos-right-heading {
      font-size: 32px !important;
      text-align: right !important;
      line-height: 1.2 !important;
      width: 100% !important;
      order: 1 !important;
    }

    .logos-left-description {
      font-size: 14px !important;
      text-align: left !important;
      max-width: 100% !important;
      line-height: 1.5 !important;
      order: 2 !important;
    }

    .logos-left-description-desktop {
      display: none !important;
    }

    .logos-left-description-mobile {
      display: block !important;
    }

    .home-logos-grid-wrap {
      display: none !important;
    }

    .logos_mobile.home-logos-mobile {
      display: block !important;
      width: 100% !important;
      margin-bottom: 40px !important;
    }

    /* Nisbi konteyner - naxışların kənar çıxıntıları kəsilməsin deyə overflow vermirik */
    .mobile-partners-grid-wrapper {
      position: relative !important;
      width: 100% !important;
    }

    .mobile-partners-grid {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      background-color: transparent !important;
      position: relative !important;
      gap: 0 !important;          /* Ensure no gap between cells */
    }

    .mobile-partner-cell {
      background-color: #4A505C !important;
      aspect-ratio: 1 / 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 12px !important;
      position: relative !important;
      border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-sizing: border-box !important;   /* ← FIX: borders included in aspect-ratio */
    }

    /* 3-cü sütunun sağ xətləri yoxdur */
    .mobile-partner-cell:nth-child(3n) {
      border-right: none !important;
    }

    /* Son sətirin alt xətləri yoxdur (indekslər 13, 14, 15) */
    .mobile-partner-cell:nth-child(n+13) {
      border-bottom: none !important;
    }

    .mobile-partner-cell img {
      max-width: 85% !important;
      max-height: 50% !important;
      object-fit: contain !important;
      filter: brightness(1.2) !important;
      opacity: 0.85 !important;
    }

    /* ── KƏSİŞMƏ NÖQTƏLƏRİNDƏKİ NAXIŞLAR – DÜZGÜN MÖVQELƏR ── */
    .mobile-grid-decor {
      position: absolute !important;
      width: 21px !important;
      height: 21px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: none !important;
      z-index: 5 !important;
      transform: translate(-50%, -50%) !important;
    }

    /* Daxili şaquli xətlər: 33.33% və 66.66% */
    /* Daxili üfüqi xətlər: 20%, 40%, 60%, 80% (5 sıra üçün) */
    .decor-x1-y1 { left: 33.33%; top: 20%; }
    .decor-x1-y2 { left: 33.33%; top: 40%; }
    .decor-x1-y3 { left: 33.33%; top: 60%; }
    .decor-x1-y4 { left: 33.33%; top: 80%; }

    .decor-x2-y1 { left: 66.66%; top: 20%; }
    .decor-x2-y2 { left: 66.66%; top: 40%; }
    .decor-x2-y3 { left: 66.66%; top: 60%; }
    .decor-x2-y4 { left: 66.66%; top: 80%; }
    
    .n-testimonials_quote {
      font-size: 21px !important;
    }
    
    .n-testimonials_card {
      padding: 42px 28px !important;
    }
    
    .swiper-nav-testimonials {
      right: 28px !important;
      bottom: 28px !important;
    }
  }

  @media screen and (min-width: 992px) {
    .logos_mobile.home-logos-mobile {
      display: none !important;
    }
  }
`;

const DecorativeIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M-4.80825e-07 11L-4.37114e-07 10L7.0459 10L7.0459 11L-4.80825e-07 11ZM11 21L10 21L10 13.9551L11 13.9551L11 21ZM10 7.45508L10 -4.80825e-07L11 -4.37114e-07L11 7.45508L10 7.45508ZM13.5459 11L13.5459 10L21 10L21 11L13.5459 11Z"
      fill="#CBCBCB"
      fillOpacity="0.5"
    />
  </svg>
);

const testimonials = [
  {
    quote: 'TREVA ilə əməkdaşlıq etdiyimiz hər bir layihədə onlar operativ intizamı təmin edirlər. Strukturlaşdırılmış, daim yenilənən siyahılar və broker lər üçün hazır alətlərlə Bakıdakı daşınmaz əmlak satış prosesi daha sürətli, daha şəffaf və idarəolunması asan olur.',
    author: "ETAGI azerbaijan"
  },
  {
    quote: 'TREVA ilə aramızda formalaşan etimad hər bir layihədə daha da möhkəmlənir. Onlar qiymət strategiyasından tutmuş müştəri axınına qədər hər detala dəqiqliklə yanaşmışdırlar. Onların yaradıcı dəstəyi, layihələrin düzgün paketlənməsi və ardıcıl izləmələri bizə güclü marağı təsirli nəticələrə çevirməyə kömək etmişdir.',
    author: "TRIDENT Investment"
  },
  {
    quote: 'TREVA-nı digərlərindən fərqləndirən iş prosesindəki aydınlıq və davamlılıqdır. Broker olaraq hər zaman məlumatlısınız: elanlar aktualdır, əlaqə çevikdir, və bütün alətlər satış prosesini asanlaşdırır.',
    author: "rnS estate"
  },
  {
    quote: 'TREVA brokerlərə lazım olan hər şeyi təqdim edir: yüksək keyfiyyətli vizuallar və effektiv lead sistemi. Biz artıq sadəcə obyekt göstərmirik, onu düzgün təqdim edirik.',
    author: "bazis real estate"
  },
  {
    quote: 'TREVA ilə tərəfdaşlığımız iş prosesimizə tam struktur gətirdi. Onların strateji planlaşdırması, brokerlərlə koordinasiyası və gündəlik dəstəyi satış prosesinə maneə yaratmadan çalışmaq imkaanları yaradır.',
    author: "AUF Invest"
  },
  {
    quote: 'TREVA-nın kampaniyaları məqsədli şəkildə hazırlanır və komandası brokerlərin səylərini aktiv şəkildə dəstəkləyərək izləmə, müştəriylə üzbəüz görüşlər və ağıllı mövqeləndirmə zamanı fəal iştirak edir. Bu cür tərəfdaşlıq real satışlarla nəticələnir.',
    author: "megapolis estate"
  },
  {
    quote: 'TREVA satış prosesində etibar edə biləcəyimiz bir tərəfdaşdır. Onların komandası bir tikinti şirkətinin ehtiyaclarını yaxşı anlayır - şəffaf hesabatlılıq, bazar tələblərinə uyğun strategiya və alıcılarla real ünsiyyət. Onların hər layihəyə göstərdiyi ardıcıl və peşəkar yanaşmanı yüksək qiymətləndiririk.',
    author: "Sabah Investment Group"
  }
];

// Mobil massiv – yalnız 15 xana (5 sətir x 3 sütun)
type MobilePartnerCell = {
  order: number;
  logo?: {
    alt: string;
    src: string;
  };
};

const mobilePartners: MobilePartnerCell[] = [
  /* Sətir 1 */
  { order: 1 },
  /* Sətir 2 */
  { order: 2, logo: { alt: "sea breeze", src: "/cdn-assets/b4ff8cd415-6887158ebff1d28bc62ec9f0_seabreeze-1.png" } },
  /* Sətir 3 */
  { order: 3 },
  /* Sətir 4 */
  { order: 4, logo: { alt: "sig", src: "/cdn-assets/15ca682d3f-6880c7caac01b2176b7a2840_SIG-blue-2.png" } },
  /* Sətir 5 */
  { order: 5, logo: { alt: "reportage", src: "/cdn-assets/38b92121c7-6880c7cfb2730b05a0143175_reportage-4.png" } },
  /* Sətir 6 */
  { order: 6, logo: { alt: "trident", src: "/cdn-assets/8def5f3166-6880c7cadbe0002df55f8ea0_Logo-Trident-1.png" } },
  { order: 7, logo: { alt: "bazis", src: "/cdn-assets/4c1106d90c-6885e01df74b709059435ec2_bazis-real-estate-logo-3.png" } },
  { order: 8, logo: { alt: "etagi", src: "/cdn-assets/7423ec34f5-6880c7ca81f1ddf220343938_Etagi-logo-1.png" } },
  { order: 9, logo: { alt: "megapolis", src: "/cdn-assets/157518584b-6880c7caaa52d1681e827451_megapolis-logo-1.png" } },
  { order: 10 },
  { order: 11 },
  { order: 12, logo: { alt: "rns", src: "/cdn-assets/828fcfb4ae-6880c7cad8c0aa9c2bf2abc3_Logo-RNS-1.png" } },
  { order: 13 },
  { order: 14, logo: { alt: "sea breeze", src: "/cdn-assets/b4ff8cd415-6887158ebff1d28bc62ec9f0_seabreeze-1.png" } },
  { order: 15 }
];

const logosDictionary = {
  az: {
    leftDescDesktop: [
      "Biz qlobal miqyasda tanınan və layihələrində",
      "keyfiyyət standartlarını əsas götürən",
      "tikinti şirkətləri ilə əməkdaşlıq edirik.",
    ],
    leftDescMobile: [
      "Biz qlobal miqyasda tanınan",
      "və layihələrində keyfiyyət",
      "standartlarını əsas götürən",
      "tikinti şirkətləri ilə əməkdaşlıq edirik.",
    ],
    rightHeadingDesktop: "SAHƏNİN ETİBARLI REPUTASİYAYA MALİK TƏRƏFDAŞLARI İLƏ BİRLİKDƏ FƏALİYYƏT GÖSTƏRİRİK",
    rightHeadingMobile: "SAHƏNİN ETİBARLI REPUTASİYAYA MALİK TƏRƏFDAŞLARI İLƏ BİRLİKDƏ FƏALİYYƏT GÖSTƏRİRİK",
    ctaNote: "Tərəfdaş şəbəkəmizə qoşulmaq istəyirsiniz?",
    ctaButton: "TREVA ilə TƏRƏFDAŞLIQ",
    testimonials: [
      { quote: 'TREVA ilə əməkdaşlıq etdiyimiz hər bir layihədə onlar operativ intizamı təmin edirlər. Strukturlaşdırılmış, daim yenilənən siyahılar və brokerlər üçün hazır alətlərlə Bakıdakı daşınmaz əmlak satış prosesi daha sürətli, daha şəffaf və idarəolunması asan olur.', author: "ETAGI azerbaijan" },
      { quote: 'TREVA ilə aramızda formalaşan etimad hər bir layihədə daha da möhkəmlənir. Onlar qiymət strategiyasından tutmuş müştəri axınına qədər hər detala dəqiqliklə yanaşmışdırlar. Onların yaradıcı dəstəyi, layihələrin düzgün paketlənməsi və ardıcıl izləmələri bizə güclü marağı təsirli nəticələrə çevirməyə kömək etmişdir.', author: "TRIDENT Investment" },
      { quote: 'TREVA-nı digərlərindən fərqləndirən iş prosesindəki aydınlıq və davamlılıqdır. Broker olaraq hər zaman məlumatlısınız: elanlar aktualdır, əlaqə çevikdir, və bütün alətlər satış prosesini asanlaşdırır.', author: "rnS estate" },
      { quote: 'TREVA brokerlərə lazım olan hər şeyi təqdim edir: yüksək keyfiyyətli vizuallar və effektiv lead sistemi. Biz artıq sadəcə obyekt göstərmirik, onu düzgün təqdim edirik.', author: "bazis real estate" },
      { quote: 'TREVA ilə tərəfdaşlığımız iş prosesimizə tam struktur gətirdi. Onların strateji planlaşdırması, brokerlərlə koordinasiyası və gündəlik dəstəyi satış prosesinə maneə yaratmadan çalışmaq imkaanları yaradır.', author: "AUF Invest" },
      { quote: 'TREVA-nın kampaniyaları məqsədli şəkildə hazırlanır və komandası brokerlərin səylərini aktiv şəkildə dəstəkləyərək izləmə, müştəriylə üzbəüz görüşlər və ağıllı mövqeləndirmə zamanı fəal iştirak edir. Bu cür tərəfdaşlıq real satışlarla nəticələnir.', author: "megapolis estate" },
      { quote: 'TREVA satış prosesində etibar edə biləcəyimiz bir tərəfdaşdır. Onların komandası bir tikinti şirkətinin ehtiyaclarını yaxşı anlayır - şəffaf hesabatlılıq, bazar tələblərinə uyğun strategiya və alıcılarla real ünsiyyət. Onların hər layihəyə göstərdiyi ardıcıl və peşəkar yanaşmanı yüksək qiymətləndiririk.', author: "Sabah Investment Group" },
    ],
  },
  en: {
    leftDescDesktop: [
      "Global network of world-leading developers.",
      "We focus on visionary design and long-term asset",
      "growth for our global clients.",
    ],
    leftDescMobile: [
      "Global network of world-leading",
      "developers. We focus on visionary",
      "design and long-term asset growth",
      "for our global clients.",
    ],
    rightHeadingDesktop: "WE WORK TOGETHER WITH TRUSTED PARTNERS WITH STRONG REPUTATION IN THE INDUSTRY",
    rightHeadingMobile: "WE WORK TOGETHER WITH TRUSTED PARTNERS WITH STRONG REPUTATION IN THE INDUSTRY",
    ctaNote: "LookIng to joIn our network of partners?",
    ctaButton: "Partner wIth TREVA",
    testimonials: [
      { quote: 'In every project we collaborated with TREVA, they ensure operational discipline. With structured, constantly updated lists and ready-to-use tools for brokers, the property sales process in Baku becomes faster, more transparent, and easier to manage.', author: "ETAGI azerbaijan" },
      { quote: 'The trust formed between us and TREVA strengthens with every project. They approach every detail with precision, from pricing strategy to customer flow. Their creative support, proper packaging of projects, and consistent follow-ups have helped us turn strong interest into effective results.', author: "TRIDENT Investment" },
      { quote: 'What sets TREVA apart from others is the clarity and consistency in their work process. As a broker, you are always informed: listings are up-to-date, communication is flexible, and all tools simplify the sales process.', author: "rnS estate" },
      { quote: 'TREVA provides brokers with everything they need: high-quality visuals and an effective lead system. We no longer just show properties — we present them correctly.', author: "bazis real estate" },
      { quote: 'Our partnership with TREVA brought complete structure to our workflow. Their strategic planning, coordination with brokers, and daily support create opportunities to work without hindering the sales process.', author: "AUF Invest" },
      { quote: 'TREVA\'s campaigns are purposefully crafted, and their team actively supports brokers\' efforts by participating in follow-ups, face-to-face meetings, and smart positioning. This kind of partnership results in real sales.', author: "megapolis estate" },
      { quote: 'TREVA is a partner we can trust in the sales process. Their team understands the needs of a construction company well — transparent reporting, strategy aligned with market demands, and real communication with buyers. We highly value their consistent and professional approach to every project.', author: "Sabah Investment Group" },
    ],
  },
  ru: {
    leftDescDesktop: [
      "Мы сотрудничаем с ведущими строительными",
      "компаниями мирового уровня, которые",
      "ставят качество в основу своих проектов.",
    ],
    leftDescMobile: [
      "Мы сотрудничаем с ведущими",
      "строительными компаниями мирового",
      "уровня, которые ставят качество",
      "в основу своих проектов.",
    ],
    rightHeadingDesktop: "МЫ РАБОТАЕМ ВМЕСТЕ С НАДЕЖНЫМИ ПАРТНЁРАМИ С УТВЕРЖДЁННОЙ РЕПУТАЦИЕЙ В ОТРАСЛИ",
    rightHeadingMobile: "МЫ РАБОТАЕМ ВМЕСТЕ С НАДЕЖНЫМИ ПАРТНЁРАМИ С УТВЕРЖДЁННОЙ РЕПУТАЦИЕЙ В ОТРАСЛИ",
    ctaNote: "Хотите присоединиться к нашей сети партнёров?",
    ctaButton: "СОТРУДНИЧАЙТЕ С TREVA",
    testimonials: [
      { quote: 'В каждом проекте, над которым мы работали с TREVA, они обеспечивают оперативную дисциплину. Структурированные, постоянно обновляемые списки и готовые инструменты для брокеров делают процесс продажи недвижимости в Баку более быстрым, прозрачным и простым в управлении.', author: "ETAGI azerbaijan" },
      { quote: 'Доверие, сформированное между нами и TREVA, крепнет с каждым проектом. Они подходят к каждой детали с точностью — от ценообразования до потока клиентов. Их творческая поддержка, правильная упаковка проектов и постоянное сопровождение помогли нам превратить сильный интерес в результаты.', author: "TRIDENT Investment" },
      { quote: 'То, что отличает TREVA от других — ясность и последовательность в работе. Как брокер, вы всегда в курсе: объявления актуальны, связь гибкая, а все инструменты упрощают процесс продажи.', author: "rnS estate" },
      { quote: 'TREVA предоставляет брокерам всё необходимое: качественные визуалы и эффективную систему лидов. Мы больше не просто показываем объекты — мы правильно их презентуем.', author: "bazis real estate" },
      { quote: 'Наше партнёрство с TREVA привнесло полную структуру в наш рабочий процесс. Их стратегическое планирование, координация с брокерами и ежедневная поддержка создают возможности для работы без помех в процессе продаж.', author: "AUF Invest" },
      { quote: 'Кампании TREVA целенаправленно разработаны, а их команда активно поддерживает усилия брокеров, участвуя в сопровождении, личных встречах и грамотной позиционировании. Такое партнёрство приводит к реальным продажам.', author: "megapolis estate" },
      { quote: 'TREVA — это партнёр, которому можно доверять в процессе продаж. Их команда хорошо понимает потребности строительной компании — прозрачная отчётность, стратегия, соответствующая требованиям рынка, и реальное общение с покупателями. Мы высоко ценим их последовательный и профессиональный подход к каждому проекту.', author: "Sabah Investment Group" },
    ],
  },
} as const;

type LogosPartnershipButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  label: string;
};

function LogosPartnershipButton({
  href,
  label,
  ...props
}: LogosPartnershipButtonProps) {
  return (
    <Link
      data-wf--button--variant="white"
      href={href}
      className="button logos-partnership-button w-variant-9209f11a-9939-4a4b-c66f-ac91791c56bc w-inline-block"
      {...props}
    >
      <ButtonText>{label}</ButtonText>
    </Link>
  );
}

type HomeLogosProps = {
  locale?: string;
};

export const HomeLogos = ({ locale = 'az' }: HomeLogosProps) => {
  const pathname = usePathname();
  const detectedLocale = pathname?.split('/')[1];
  const activeLocale = (detectedLocale && detectedLocale in logosDictionary)
    ? detectedLocale as keyof typeof logosDictionary
    : locale as keyof typeof logosDictionary;
  const content = logosDictionary[activeLocale];

  useEffect(() => {
    const swiper = new Swiper('.swiper-testimonials', {
      modules: [Navigation, Autoplay],
      speed: 800,
      loop: false,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        stopOnLastSlide: true,
      },
      navigation: {
        nextEl: '.swiper-testimonials-next',
        prevEl: '.swiper-testimonials-prev',
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return (
    <section className="section_logos home-logos-section bg-color-blue100 parallax-reveal">
      <style dangerouslySetInnerHTML={{ __html: productionStyles }} />
      <PageContainer className="home-logos-padding padding-section-medium">
          <div className="logos_component home-logos-component">
            
            {/* Intro Section */}
            <div className="logos_intro home-logos-intro">
              
              {/* Desktop versiyası */}
              <p className="logos-left-description logos-left-description-desktop">
                {content.leftDescDesktop.map((line, i) => (
                  <React.Fragment key={i}>{line}{i < content.leftDescDesktop.length - 1 && <br />}</React.Fragment>
                ))}
              </p>

              {/* Mobil versiyası */}
              <p className="logos-left-description logos-left-description-mobile">
                {content.leftDescMobile.map((line, i) => (
                  <React.Fragment key={i}>{line}{i < content.leftDescMobile.length - 1 && <br />}</React.Fragment>
                ))}
              </p>

              {/* Başlıq */}
              <h2 className="logos-right-heading">
                <span className="block md:hidden">
                  {content.rightHeadingMobile}
                </span>
                <span className="hidden md:block">
                  {content.rightHeadingDesktop}
                </span>
              </h2>
              
            </div>

            {/* Desktop Logos Grid */}
            <div className="logos_wrap home-logos-grid-wrap">
              {/* Row 1 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder">
                  <div className="logos_cell is-half"></div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="100"
                        loading="lazy"
                        alt="sig"
                        src="/cdn-assets/15ca682d3f-6880c7caac01b2176b7a2840_SIG-blue-2.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="187"
                        loading="lazy"
                        alt="seabreeze real estate"
                        src="/cdn-assets/b4ff8cd415-6887158ebff1d28bc62ec9f0_seabreeze-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="154"
                        loading="lazy"
                        alt="reportage properties"
                        src="/cdn-assets/38b92121c7-6880c7cfb2730b05a0143175_reportage-4.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder no-left">
                  <div className="logos_cell is-half"></div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder">
                  <div className="logos_cell is-half">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="76"
                        loading="lazy"
                        alt="etagi"
                        src="/cdn-assets/7423ec34f5-6880c7ca81f1ddf220343938_Etagi-logo-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="55.5"
                        loading="lazy"
                        alt="trident"
                        src="/cdn-assets/8def5f3166-6880c7cadbe0002df55f8ea0_Logo-Trident-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a80fd-82ace242" className="logos_cell-holder">
                  <div className="logos_cell is-half">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a8101-82ace242" className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="81"
                        loading="lazy"
                        alt="megapolis estate"
                        src="/cdn-assets/157518584b-6880c7caaa52d1681e827451_megapolis-logo-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a8107-82ace242" className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="215"
                        loading="lazy"
                        alt="auf invest"
                        src="/cdn-assets/7a685b68a5-688c5e4e39e6dc2ebee591e2_AUF-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonials Swiper */}
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a810d-82ace242" className="testimonials_slider">
                  <div className="swiper swiper-testimonials">
                    <div className="swiper-wrapper swiper-wrapper-testimonials">
                      {content.testimonials.map((item, idx) => (
                        <div key={idx} className="swiper-slide swiper-slide-testimonials">
                          <div className="n-testimonials_card home-logos-testimonial-card">
                            <p className="n-testimonials_quote home-logos-testimonial-quote">{item.quote}</p>
                            <div className="n-testimonials_specs home-logos-testimonial-specs">
                              <div className="n-testimonials_author-wrap home-logos-testimonial-author-wrap">
                                <div className="home-logos-testimonial-author">
                                  {item.author}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="swiper-nav swiper-nav-testimonials">
                    <div className="swiper-testimonials-prev">
                      <div className="icon w-embed">
                        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.78299 1.78543C9.96665 1.97554 9.96142 2.27853 9.77131 2.46219L4.71543 7.3466C4.52067 7.53475 4.52067 7.84688 4.71543 8.03503L9.77131 12.9194C9.96142 13.1031 9.96664 13.4061 9.78299 13.5962L8.6718 14.7464C8.48814 14.9365 8.18515 14.941 7.99504 14.7581L1.03599 8.03503C0.841227 7.84688 0.841227 7.53475 1.03599 7.3466L7.99504 0.62356C8.18515 0.439901 8.48814 0.445128 8.6718 0.635234L9.78299 1.78543ZM2.37996 14.7573C2.18985 14.941 1.88686 14.9357 1.7032 14.7456L0.592012 13.5954Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="swiper-testimonials-next">
                      <div className="icon w-embed">
                        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.592012 13.5954C0.408353 13.4053 0.41358 13.1023 0.603685 12.9187L5.65956 8.03426C5.85432 7.84611 5.85432 7.53398 5.65956 7.34583L0.603685 2.46142C0.413579 2.27776 0.408352 1.97477 0.59201 1.78466L1.7032 0.634465C1.88686 0.44436 2.18985 0.439913 2.37996 0.622791L9.33901 7.34583C9.53377 7.53398 9.53377 7.84611 9.33901 8.03426L2.37996 14.7573C2.18985 14.941 1.88686 14.9357 1.7032 14.7456L0.592012 13.5954Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell is-half"></div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="57"
                        loading="lazy"
                        alt="rns real estate"
                        src="/cdn-assets/828fcfb4ae-6880c7cad8c0aa9c2bf2abc3_Logo-RNS-1.png"
                        className="logos_img"
                      />
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="155"
                        loading="lazy"
                        alt="villa az"
                        src="/cdn-assets/94147fe51b-6887158e4499458c3bafba1f_villa-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration is-up">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="92"
                        loading="lazy"
                        alt="bazis real estate"
                        src="/cdn-assets/4c1106d90c-6885e01df74b709059435ec2_bazis-real-estate-logo-3.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration is-up">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder no-left no-bottom">
                  <div className="logos_cell is-half"></div>
                </div>
              </div>

              {/* Gradients */}
              <div className="n-testimonials_black-gradient is-left"></div>
              <div className="n-testimonials_black-gradient is-top"></div>
              <div className="n-testimonials_black-gradient is-bottom"></div>
            </div>

            {/* Responsive Mobile Partners Grid */}
            <div className="logos_mobile home-logos-mobile">
              <div className="mobile-partners-grid-wrapper">
                <div className="mobile-partners-grid">
                  {[...mobilePartners]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div key={item.order} className="mobile-partner-cell" style={{ order: item.order }}>
                        {item.logo?.src && (
                          <img src={item.logo.src} alt={item.logo.alt} loading="lazy" />
                        )}
                      </div>
                    ))}
                </div>

                {/* MOBİL GRİDDƏ KƏSİŞƏN BÜTÜN DAXİLİ XƏTLƏRİN ÜZƏRİNƏ YERLƏŞDİRİLƏN 8 ƏDƏD NAXIŞ */}
                <div className="mobile-grid-decor decor-x1-y1"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x1-y2"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x1-y3"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x1-y4"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x2-y1"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x2-y2"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x2-y3"><DecorativeIcon /></div>
                <div className="mobile-grid-decor decor-x2-y4"><DecorativeIcon /></div>
              </div>
            </div>

            {/* CTA */}
            <div className="logos_cta-wrap home-logos-cta-wrap">
              <div className="note_wrap home-logos-note-wrap is-white">
                <div className="text-color-white60 home-logos-note-text">{content.ctaNote}</div>
              </div>
              <LogosPartnershipButton
                href="brokers#broker-registration"
                label={content.ctaButton}
              />
            </div>
          </div>
      </PageContainer>
    </section>
  );
}
