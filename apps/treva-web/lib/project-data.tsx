import React from "react";
import { Project } from "./project.types";

export const PROJECTS: Project[] = [
  {
    slug: "villa-siena",
    title: "Villa Siena",
    heroTitle: (
      <>
        <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <em>VIlla SIena</em>, Toskana üslubunda Eksklüziv Rezidensiya
      </>
    ),
    heroImage: "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif",
    heroAlt: "Villa Siena Header",
    externalLink: "https://villasiena.az/",
    
    overviewTitle: (
      <>
        <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        LAYİHƏNİN TƏQDİM ETDİYİ YAŞAM İMKANLARI VƏ ÜSTÜNLÜKLƏRİ
      </>
    ),
    overviewLabel: "(layihənin ümumi icmalı)",
    overviewItems: [
      {
        number: "01",
        title: "ÜSTÜNLÜKLƏR",
        content: "Villa Siena Xəzər dənizinin yaxınlığında canlanan kiçik İtaliyadır. Toskana memarlığının əzəmətli daş fasadları və qırmızı kirəmitli damları Bakının mülayim dəniz havası ilə harmoniya yaradaraq sizə tamamilə fərqli bir dünya bəxş edir. Burada hər bir detal sakinlərin özlərini həm təbiətin qoynunda, həm də yüksək estetik mühitdə hiss etmələri üçün düşünülüb. Şəhər mərkəzindən cəmi 20 dəqiqəlik məsafədə yerləşməsi isə iş həyatından qopmadan təbiətlə iç-içə yaşamaq istəyənlər üçün ideal balansı təmin edir."
      },
      {
        number: "02",
        title: "İMKANLAR",
        content: "Villa Siena-da həyat geniş və funksional bir məkanda keçir. Hər bir villanın özünəməxsus geniş həyətyanı sahəsi və şəxsi hovuzu, yay aylarını istirahət ab-havasında keçirməyiniz üçün mükəmməl şərait yaradır. Kompleks daxilindəki landşaft dizaynı, gəzinti zolaqları və uşaqlar üçün nəzərdə tutulmuş təhlükəsiz zonalar ailəvi istirahətinizi rəngarəng edir. Bütün bunlarla yanaşı, 7/24 fəaliyyət göstərən peşəkar mühafizə xidməti və inkişaf etmiş infrastruktur, sizin və sevdiklərinizin tam təhlükəsizliyini və rahatlığını ən yüksək səviyyədə təmin edir."
      },
      {
        number: "03",
        title: "PERSPEKTİVLƏR",
        content: "Buzovna ərazisi tarixən Bakı elitasının ən çox üz tutduğu istirahət məkanları olub və bu status bu gün də qorunur. Villa Siena kimi unikal memarlıq konseptinə malik qapalı şəhərcikdə mülk sahibi olmaq, zaman keçdikcə dəyəri artan nadir bir aktivə sahib olmaq deməkdir. Dənizə yaxınlığı, hava limanına qısa məsafəsi və regionun sürətli inkişafı bu layihəni həm şəxsi yaşayış, həm də yüksək gəlirli icarə biznesi üçün əvəzsiz bir investisiya alətinə çevirir."
      }
    ],
    overviewGallery: [
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e44664d8505502fda9_1226X1171.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e4aca888552dabe68d_1920X783.avif"
    ],
    
    detailsTitle: (
      <>
        <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        VILLA SIENA — BUZOVNADA YERLƏŞƏN, TOSKANA ÜSLUBUNDA DİZAYN EDİLMİŞ, GENİŞ İNTERYERLİ, ŞƏXSİ HOVUZLU VƏ PREMIUM TƏRTİBATLI VİLLALAR, 4,6 HEKTARLIQ ABADLAŞDIRILMIŞ ƏRAZİDƏ.
      </>
    ),
    detailsRows: [
      { label: "Növü", value: "YAŞAYIŞ KOMPLEKSİ" },
      { label: "Təhvil verilmə tarixi", value: "2016" },
      { label: "Status", value: "TAMAMLANDI" },
      { label: "Ünvan", value: "Azərbaycan, Bakı, Buzovna qəsəbəsi, əsas magistral yol, 3-cü kilometr" },
      { label: "Hədəf auditoriya", value: "Lüks ev sahibləri, Şəxsi investorlar, Yüksək gəlirli şəxslər, Ailələr" },
      { 
        label: "Unikal Satış Nöqtələr", 
        value: (
          <>
            Ekoloji təmiz məkan<br/>Rahat nəqliyyat əlçatanlığı<br/>Toskana üslubunda memarlıq
          </>
        ) 
      }
    ],
    
    socialLinks: {
      instagram: "https://www.instagram.com/marinavillage.seabreeze?igsh=MTEwODlpZXpucWlkbQ==",
      tiktok: "https://www.tiktok.com/@marinavillage.seabreeze?_t=ZS-8yS8w1RNSkR&_r=1"
    },
    
    videoLink: "#",
    
    ctaImages: [
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6877795ce390ea79b5c67e2e_1014X598.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif",
      "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif"
    ],
    
    seoTitle: {
      az: "Villa Siena Komfortlu Villalar | TREVA Real Estate",
      en: "Villa Siena Comfortable Villas | TREVA Real Estate",
      ru: "Villa Siena Комфортные Виллы | TREVA Real Estate",
    },
    seoDescription: {
      az: "Villa Siena layihəsində komfortlu villalar, müasir dizayn və sakit yaşayış mühiti. Yüksək keyfiyyətli tikinti və investisiya üçün ideal seçim. İndi seçin!",
      en: "Comfortable villas in the Villa Siena project, modern design and quiet living environment. High quality construction and ideal choice for investment. Choose now!",
      ru: "Комфортабельные виллы в проекте Villa Siena, современный дизайн и спокойная жилая среда. Высокое качество строительства и идеальный выбор для инвестиций. Выбирайте сейчас!",
    },
    ogImage: "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687dee7f7f77ffad0c85b58e_Open%20Graph.jpg"
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug);
}
