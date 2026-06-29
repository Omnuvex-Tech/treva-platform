export interface LocalizedString {
  az?: string;
  en?: string;
  ru?: string;
}

export interface HeroImage {
  url: string;
  alt: string;
}

export interface OverviewDataRow {
  key: string;
  value: string;
}

export interface FeatureSection {
  id: string;
  titleItalic: string;
  titleRest: string;
  subtitle: string;
  items: string[];
  dark: boolean;
  image: string;
  imageLeft: boolean;
}

export interface ProjectDetail {
  id: string;
  categorySlug: string;

  heroTitle: LocalizedString;
  heroDesktopDesc: LocalizedString;
  heroMobileDesc: LocalizedString;
  heroImages: HeroImage[];
  heroCtaText: LocalizedString;
  heroCtaLink: string;

  overviewTitleLight: LocalizedString;
  overviewTitleBold: LocalizedString;
  overviewBrandName: LocalizedString;
  overviewDebutText: LocalizedString;
  overviewLocationText: LocalizedString;
  overviewDebutTextEnd: LocalizedString;
  overviewDescription: LocalizedString;
  overviewImageLarge: string;
  overviewImageLargeLabel: LocalizedString;
  overviewImageMedium: string;
  overviewImageMediumLabel: LocalizedString;
  overviewImageSmall: string;
  overviewImageSmallLabel: LocalizedString;
  overviewDataRows: OverviewDataRow[];

  featuresHeaderMain: LocalizedString;
  featuresHeaderSub: LocalizedString;
  featuresTitleLight: LocalizedString;
  featuresTitleBold: LocalizedString;
  featuresSections: FeatureSection[];
  brochureFile: string;

  locationTitleLight: LocalizedString;
  locationTitleBold: LocalizedString;
  locationBrandName: LocalizedString;
  locationMainLead: LocalizedString;
  locationSubText: LocalizedString;
  locationMapImage: string;
  locationFooterAddress: LocalizedString;
  locationGoogleMapsUrl: string;

  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  ogImage: string;
}
