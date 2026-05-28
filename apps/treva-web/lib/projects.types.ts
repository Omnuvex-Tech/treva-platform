import React from "react";

export interface ProjectHeroData {
  title: React.ReactNode;
  desktopDescription: React.ReactNode;
  mobileDescription: React.ReactNode;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

export interface ProjectOverviewImage {
  url: string;
  label: string;
}

export interface ProjectOverviewData {
  titleLight: string;
  titleBold: string;
  brandName: string;
  debutText: string;
  locationText: string;
  debutTextEnd: string;
  description: React.ReactNode;
  images: {
    large: ProjectOverviewImage;
    medium: ProjectOverviewImage;
    small: ProjectOverviewImage;
  };
  dataRows: { key: string; value: React.ReactNode }[];
}

export interface ProjectLocationData {
  titleLight: string;
  titleBold: string;
  mainLead: React.ReactNode;
  subText: React.ReactNode;
  mapImage: string;
  footerAddress: React.ReactNode;
}

export interface ProjectLayoutData {
  title: string;
  code: string;
  floor: string;
  number: string;
  svgBlueprint: React.ReactNode;
  price: string;
}

export interface ProjectFeaturesSection {
  id: string;
  title: { italic: string; rest: string };
  subtitle: string;
  items: string[];
  dark: boolean;
  image: string;
  imageLeft: boolean;
}

export interface ProjectFeaturesData {
  headerMain: React.ReactNode;
  headerSub: React.ReactNode;
  titleLight: string;
  titleBold: string;
  brochureLink?: string;
  sections: ProjectFeaturesSection[];
}

export interface ProjectModel {
  slug: string;
  hero: ProjectHeroData;
  overview: ProjectOverviewData;
  location: ProjectLocationData;
  layouts: ProjectLayoutData[];
  features: ProjectFeaturesData;
  // Metadata
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  ogImage: string;
}
