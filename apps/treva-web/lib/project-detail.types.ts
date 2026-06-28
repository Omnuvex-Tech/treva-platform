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

  heroTitle: string;
  heroDesktopDesc: string;
  heroMobileDesc: string;
  heroImages: HeroImage[];
  heroCtaText: string;
  heroCtaLink: string;

  overviewTitleLight: string;
  overviewTitleBold: string;
  overviewBrandName: string;
  overviewDebutText: string;
  overviewLocationText: string;
  overviewDebutTextEnd: string;
  overviewDescription: string;
  overviewImageLarge: string;
  overviewImageLargeLabel: string;
  overviewImageMedium: string;
  overviewImageMediumLabel: string;
  overviewImageSmall: string;
  overviewImageSmallLabel: string;
  overviewDataRows: OverviewDataRow[];

  featuresHeaderMain: string;
  featuresHeaderSub: string;
  featuresTitleLight: string;
  featuresTitleBold: string;
  featuresSections: FeatureSection[];
  brochureFile: string;

  locationTitleLight: string;
  locationTitleBold: string;
  locationMainLead: string;
  locationSubText: string;
  locationMapImage: string;
  locationFooterAddress: string;
  locationGoogleMapsUrl: string;

  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}
