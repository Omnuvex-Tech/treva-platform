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
  locale: string;
}

export default function DynamicProjectLayouts({ categorySlug, locale }: Props) {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const trevaApiUrl =
          process.env.NEXT_PUBLIC_TREVA_API_URL ||
          "http://localhost:10011/api/v1";
        const res = await fetch(
          `${trevaApiUrl}/unit-layouts?categorySlug=${categorySlug}&limit=10`
        );
        if (!res.ok) return;
        const rawData = await res.json();
        const items: ApiUnitLayout[] =
          rawData.data || rawData.items || rawData;

        if (items && items.length > 0) {
          const apiUrl = trevaApiUrl.replace(/\/api\/v1\/?$/, "");
          const shuffled = [...items].sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, 3);
          setLayouts(
            picked.map((item) => ({
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
        }
      } catch {
        // No layouts available
      }
    };

    fetchLayouts();
  }, [categorySlug]);

  if (layouts.length === 0) return null;

  return (
    <ProjectLayouts
      layouts={layouts}
      categorySlug={categorySlug}
      locale={locale}
      viewAllHref={`/${locale}/off-plan?category=${categorySlug}`}
    />
  );
}
