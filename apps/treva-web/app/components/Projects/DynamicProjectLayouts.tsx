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
  image?: string;
  svgBlueprint?: React.ReactNode;
}

interface Props {
  categorySlug: string;
  fallbackLayouts: LayoutItem[];
  locale: string;
}

export default function DynamicProjectLayouts({ categorySlug, fallbackLayouts, locale }: Props) {
  const [layouts, setLayouts] = useState<LayoutItem[]>(fallbackLayouts);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
        const res = await fetch(
          `${trevaApiUrl}/unit-layouts?categorySlug=${categorySlug}&limit=10`
        );
        if (!res.ok) return;
        const rawData = await res.json();
        const items: ApiUnitLayout[] = rawData.data || rawData.items || rawData;

        if (items && items.length > 0) {
          const apiUrl = trevaApiUrl.replace(/\/api\/v1\/?$/, "");
          setLayouts(
            items.map((item) => ({
              title: item.title,
              code: item.name || item.title,
              floor: `${item.floor} floor`,
              number: item.number ? `N° ${item.number}` : "",
              price: item.prices?.USD
                ? `$${item.prices.USD.toLocaleString()}`
                : item.prices?.AZN
                ? `₼${item.prices.AZN.toLocaleString()}`
                : "",
              image: item.mainImage?.url
                ? item.mainImage.url.startsWith("http")
                  ? item.mainImage.url
                  : `${apiUrl}${item.mainImage.url}`
                : undefined,
            }))
          );
          setFromApi(true);
        }
      } catch {
        // Use fallback static layouts
      }
    };

    fetchLayouts();
  }, [categorySlug]);

  return (
    <ProjectLayouts
      layouts={layouts}
      categorySlug={categorySlug}
      viewAllHref={`/${locale}/off-plan?category=${categorySlug}`}
    />
  );
}
