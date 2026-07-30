"use client";

import React, { useEffect, useState } from "react";
import ProjectLayouts from "./ProjectLayouts";

interface ApiUnitLayout {
  id: string;
  title: string;
  name: string;
  slug: string;
  floor: number;
  number?: number;
  totalArea: number;
  internalArea: number;
  balconyArea?: number;
  prices: Record<string, number>;
  mainImage?: { url: string } | null;
}

interface LayoutItem {
  title: string;
  code: string;
  floor: string;
  number: string;
  price: string;
  slug: string;
  image?: string;
}

interface Props {
  categorySlug: string;
  fallbackCategorySlug?: string;
  locale: string;
}

export default function DynamicProjectLayouts({ categorySlug, fallbackCategorySlug, locale }: Props) {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(categorySlug);

  useEffect(() => {
    const fetchLayouts = async () => {
      if (!categorySlug) {
        setLayouts([]);
        setActiveCategorySlug(categorySlug);
        return;
      }
      try {
        const trevaApiUrl =
          process.env.NEXT_PUBLIC_TREVA_API_URL ||
          "http://localhost:10011/api/v1";
        const fetchForSlug = async (slug: string) => {
          const res = await fetch(
            `${trevaApiUrl}/unit-layouts?categorySlug=${encodeURIComponent(slug)}&limit=3`
          );
          if (!res.ok) return [];
          const rawData = await res.json();
          const data = rawData?.data ?? rawData?.items ?? rawData;
          if (Array.isArray(data)) return data as ApiUnitLayout[];
          if (Array.isArray(data?.data)) return data.data as ApiUnitLayout[];
          return [];
        };

        let items = await fetchForSlug(categorySlug);
        let usedSlug = categorySlug;
        if (items.length === 0 && fallbackCategorySlug && fallbackCategorySlug !== categorySlug) {
          items = await fetchForSlug(fallbackCategorySlug);
          usedSlug = fallbackCategorySlug;
        }

        if (items && items.length > 0) {
          const apiUrl = trevaApiUrl.replace(/\/api\/v1\/?$/, "");
          setActiveCategorySlug(usedSlug);
          setLayouts(
            items.slice(0, 3).map((item) => ({
              title: item.title,
              code: item.name || item.title,
              floor: `${item.floor} floor`,
              number: item.number ? `N° ${item.number}` : "",
              price: item.prices?.USD
                ? `$${item.prices.USD.toLocaleString()}`
                : item.prices?.AZN
                ? `₼${item.prices.AZN.toLocaleString()}`
                : "",
              slug: item.slug,
              image: item.mainImage?.url
                ? item.mainImage.url.startsWith("http")
                  ? item.mainImage.url
                  : `${apiUrl}${item.mainImage.url}`
                : undefined,
            }))
          );
        } else {
          setLayouts([]);
          setActiveCategorySlug(usedSlug);
        }
      } catch {
        setLayouts([]);
        setActiveCategorySlug(categorySlug);
      }
    };

    fetchLayouts();
  }, [categorySlug, fallbackCategorySlug]);

  if (layouts.length === 0) return null;

  return (
    <ProjectLayouts
      layouts={layouts}
      categorySlug={activeCategorySlug}
      locale={locale}
      viewAllHref={`/${locale}/off-plan?category=${activeCategorySlug}`}
    />
  );
}
