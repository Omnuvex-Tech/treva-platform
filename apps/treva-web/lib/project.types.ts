import React from "react";

export interface ProjectOverviewItem {
  number: string;
  title: string;
  content: string;
}

export interface ProjectDetailRow {
  label: string;
  value: string | React.ReactNode;
}

export interface Project {
  slug: string;
  title: string;
  heroTitle: React.ReactNode;
  heroImage: string;
  heroAlt: string;
  externalLink: string;
  
  overviewTitle: React.ReactNode;
  overviewLabel: string;
  overviewItems: ProjectOverviewItem[];
  overviewGallery: string[];
  
  detailsTitle: React.ReactNode;
  detailsRows: ProjectDetailRow[];
  
  socialLinks: {
    instagram?: string;
    tiktok?: string;
  };
  
  videoLink?: string;
  
  ctaImages: string[];
  
  // Metadata
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  ogImage: string;
}
