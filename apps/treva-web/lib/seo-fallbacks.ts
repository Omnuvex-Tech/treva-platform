import type { Metadata } from "next";
import { config } from "@/config";
import { buildPageMetadata, type SeoFallback } from "@/lib/seo";

/**
 * Admin-in "SEO" bölməsi boş olduqda istifadə olunan ehtiyat mətnlər.
 * Açar = PageMeta pageKey (statik səhifələr).
 */
type Trilingual = { az: string; en: string; ru: string };

const TITLES: Record<string, Trilingual> = {
  home: {
    az: "TREVA Real Estate — Azərbaycanda daşınmaz əmlak platforması",
    en: "TREVA Real Estate — Property platform in Azerbaijan",
    ru: "TREVA Real Estate — платформа недвижимости в Азербайджане",
  },
  "about-us": {
    az: "Haqqımızda | TREVA Real Estate",
    en: "About Us | TREVA Real Estate",
    ru: "О нас | TREVA Real Estate",
  },
  projects: {
    az: "Layihələr | TREVA Real Estate",
    en: "Projects | TREVA Real Estate",
    ru: "Проекты | TREVA Real Estate",
  },
  "off-plan": {
    az: "Tikilməkdə olan layihələr | TREVA Real Estate",
    en: "Off-Plan Properties | TREVA Real Estate",
    ru: "Строящаяся недвижимость | TREVA Real Estate",
  },
  resale: {
    az: "İkinci əl daşınmaz əmlak | TREVA Real Estate",
    en: "Resale Properties | TREVA Real Estate",
    ru: "Вторичная недвижимость | TREVA Real Estate",
  },
  brokers: {
    az: "Brokerlər | TREVA Real Estate",
    en: "Brokers | TREVA Real Estate",
    ru: "Брокеры | TREVA Real Estate",
  },
  developers: {
    az: "Developerlər | TREVA Real Estate",
    en: "Developers | TREVA Real Estate",
    ru: "Девелоперы | TREVA Real Estate",
  },
  pulse: {
    az: "Pulse — daşınmaz əmlak xəbərləri | TREVA Real Estate",
    en: "Pulse — real estate insights | TREVA Real Estate",
    ru: "Pulse — новости недвижимости | TREVA Real Estate",
  },
  contact: {
    az: "Əlaqə | TREVA Real Estate",
    en: "Contact | TREVA Real Estate",
    ru: "Контакты | TREVA Real Estate",
  },
  "privacy-policy": {
    az: "Məxfilik Siyasəti | TREVA Real Estate",
    en: "Privacy Policy | TREVA Real Estate",
    ru: "Политика конфиденциальности | TREVA Real Estate",
  },
};

const DESCRIPTIONS: Partial<Record<string, Trilingual>> = {
  "privacy-policy": {
    az: "TREVA Real Estate şəxsi məlumatlarınızı necə toplayır, istifadə edir və qoruyur.",
    en: "How TREVA Real Estate collects, uses and protects your personal data.",
    ru: "Как TREVA Real Estate собирает, использует и защищает ваши персональные данные.",
  },
};

export function getSeoFallback(pageKey: string, locale: string): SeoFallback {
  const lang = (["az", "en", "ru"].includes(locale) ? locale : "az") as
    | "az"
    | "en"
    | "ru";
  return {
    title: TITLES[pageKey]?.[lang],
    description:
      DESCRIPTIONS[pageKey]?.[lang] ?? config.project.projectDescription,
    keywords: [...config.project.keywords],
  };
}

/**
 * Statik səhifələr üçün hazır `generateMetadata`. İstifadəsi:
 *   export const generateMetadata = staticPageMetadata("about-us");
 */
export function staticPageMetadata(pageKey: string) {
  return async ({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> => {
    const { locale } = await params;
    return buildPageMetadata({
      pageKey,
      locale,
      fallback: getSeoFallback(pageKey, locale),
    });
  };
}
