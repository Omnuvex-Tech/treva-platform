/**
 * Layihə detalı — blok (section) əsaslı tiplər.
 *
 * CMS tərəfindəki `apps/cms-api/src/modules/Layihelerimiz/project-sections.ts`
 * faylı ilə eyni formanı təsvir edir. Birini dəyişəndə o birini də dəyiş.
 */

export interface LocalizedString {
  az?: string;
  en?: string;
  ru?: string;
}

/** Köhnə yazılarda `alt` düz string ola bilər — normalizasiya loc() ilə edilir. */
export interface HeroImage {
  url: string;
  alt: LocalizedString | string;
}

export interface ImageSlot {
  url: string;
  label: LocalizedString;
}

export interface OverviewDataRow {
  key: LocalizedString;
  value: LocalizedString;
}

export interface FeatureBlock {
  id: string;
  titleItalic: LocalizedString;
  titleRest: LocalizedString;
  subtitle: LocalizedString;
  items: LocalizedString[];
  dark: boolean;
  image: string;
  imageLeft: boolean;
}

interface SectionBase {
  isVisible?: boolean;
}

export interface HeroSection extends SectionBase {
  type: "hero";
  title: LocalizedString;
  desktopDesc: LocalizedString;
  mobileDesc: LocalizedString;
  images: HeroImage[];
  ctaText: LocalizedString;
  ctaLink: string;
}

export interface OverviewSection extends SectionBase {
  type: "overview";
  titleLight: LocalizedString;
  titleBold: LocalizedString;
  brandName: LocalizedString;
  debutText: LocalizedString;
  locationText: LocalizedString;
  debutTextEnd: LocalizedString;
  description: LocalizedString;
  images: {
    large: ImageSlot;
    medium: ImageSlot;
    small: ImageSlot;
  };
  dataRows: OverviewDataRow[];
}

export interface FeaturesSection extends SectionBase {
  type: "features";
  headerMain: LocalizedString;
  headerSub: LocalizedString;
  titleLight: LocalizedString;
  titleBold: LocalizedString;
  sections: FeatureBlock[];
  brochureFile: string;
}

export interface LocationSection extends SectionBase {
  type: "location";
  titleLight: LocalizedString;
  titleBold: LocalizedString;
  brandName: LocalizedString;
  mainLead: LocalizedString;
  subText: LocalizedString;
  mapImage: string;
  footerAddress: LocalizedString;
  googleMapsUrl: string;
}

/** Qalereyadakı bir kadr — interyer/eksteryer fotosu. */
export interface GalleryItem {
  url: string;
  caption: LocalizedString;
}

/** İnteryer/eksteryer foto qalereyası — sərbəst sayda şəkil. */
export interface GallerySection extends SectionBase {
  type: "gallery";
  titleLight: LocalizedString;
  titleBold: LocalizedString;
  description: LocalizedString;
  items: GalleryItem[];
}

/** Mənzil planları — datasını categorySlug üzərindən özü çəkir, sahəsi yoxdur. */
export interface LayoutsSection extends SectionBase {
  type: "layouts";
}

export type ProjectSection =
  | HeroSection
  | OverviewSection
  | FeaturesSection
  | LocationSection
  | LayoutsSection
  | GallerySection;

export type ProjectSectionType = ProjectSection["type"];

export interface ProjectDetail {
  id: string;
  categorySlug: string;
  sections: ProjectSection[];

  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  ogImage: string;
}

/** Lokalizasiya olunmuş dəyərdən cari dilə uyğun mətni çıxarır. */
export function loc(
  obj: LocalizedString | string | undefined | null,
  locale: string,
  fallback = "",
): string {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj || fallback;
  return (obj as any)[locale] || obj.az || obj.en || obj.ru || fallback;
}
