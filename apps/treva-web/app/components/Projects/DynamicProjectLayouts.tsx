"use client";

import React, { useEffect, useState } from "react";
import ProjectLayouts from "./ProjectLayouts";

interface ApiUnitLayout {
  id: string;
  title: string;
  name: string;
  slug: string;
  floor: number;
  numberOfFloors?: { start: number; end: number } | null;
  number?: number;
  totalArea: number;
  internalArea: number;
  balconyArea?: number;
  unitTypeOption?: { id: string; name: string; title: string } | null;
  prices: Record<string, number>;
  mainImage?: { url: string } | null;
  coverImage?: { url: string } | null;
}

interface ApiCategory {
  id: string;
  slug: string;
  name?: string | null;
  title?: string | null;
  propertyName?: string | null;
}

interface LayoutItem {
  title: string;
  code: string;
  floor: string;
  number: string;
  unitType?: string;
  area?: number;
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
      const slugs = [categorySlug, fallbackCategorySlug].filter(Boolean) as string[];
      const uniqueSlugs = Array.from(new Set(slugs.map((s) => String(s).trim()).filter(Boolean)));
      if (uniqueSlugs.length === 0) {
        setLayouts([]);
        setActiveCategorySlug(categorySlug || "");
        return;
      }

      try {
        const trevaApiUrl =
          process.env.NEXT_PUBLIC_TREVA_API_URL ||
          "http://localhost:10011/api/v1";

        const fetchForSlug = async (slug: string) => {
          const res = await fetch(
            `${trevaApiUrl}/unit-layouts?categorySlug=${encodeURIComponent(slug)}&limit=3&archived=false`
          );
          if (!res.ok) return [];
          const rawData = await res.json();
          const data = rawData?.data ?? rawData?.items ?? rawData;
          if (Array.isArray(data)) return data as ApiUnitLayout[];
          if (Array.isArray(data?.data)) return data.data as ApiUnitLayout[];
          return [];
        };

        const resolveCategorySlug = async (slug: string) => {
          const res = await fetch(`${trevaApiUrl}/categories?type=object`);
          if (!res.ok) return null;
          const raw = await res.json();
          const data = raw?.data ?? raw?.items ?? raw;
          const items = Array.isArray(data) ? (data as ApiCategory[]) : Array.isArray(data?.data) ? (data.data as ApiCategory[]) : [];
          const match = items.find((cat) => {
            const catSlug = String(cat?.slug || "");
            const prop = String(cat?.propertyName || "");
            const name = String(cat?.name || "");
            if (catSlug === slug) return true;
            if (prop && prop === slug) return true;
            if (name && name === slug) return true;
            if (catSlug && slug && catSlug.startsWith(`${slug}-`)) return true;
            return false;
          });
          return match?.slug ? String(match.slug) : null;
        };

        let items: ApiUnitLayout[] = [];
        let usedSlug: string = uniqueSlugs[0] || "";

        for (const candidate of uniqueSlugs) {
          usedSlug = candidate;
          items = await fetchForSlug(candidate);
          if (items.length > 0) break;

          const resolved = await resolveCategorySlug(candidate);
          if (resolved && resolved !== candidate) {
            usedSlug = resolved;
            items = await fetchForSlug(resolved);
            if (items.length > 0) break;
          }
        }

        if (items && items.length > 0) {
          const apiUrl = trevaApiUrl.replace(/\/api\/v1\/?$/, "");
          setActiveCategorySlug(usedSlug);
          const formatRooms = (rooms?: number) => {
            if (!rooms || rooms <= 0) return "";
            if (locale === "ru") return `${rooms} комн.`;
            if (locale === "en") return `${rooms} ${rooms === 1 ? "room" : "rooms"}`;
            return `${rooms} otaqlı`;
          };
          const floorSuffix = locale === "ru" ? "этаж" : locale === "en" ? "floor" : "mərtəbə";
          const formatFloorRange = (item: ApiUnitLayout) => {
            const start = item.numberOfFloors?.start;
            const end = item.numberOfFloors?.end;
            if (typeof start === "number" && typeof end === "number") {
              return start !== end ? `${start}-${end} ${floorSuffix}` : `${start} ${floorSuffix}`;
            }
            return `${item.floor} ${floorSuffix}`;
          };
          setLayouts(
            items.slice(0, 3).map((item) => ({
              title: item.title,
              code: item.title || item.name,
              floor: formatFloorRange(item),
              number: formatRooms(item.number),
              unitType: item.unitTypeOption?.title || "",
              area: item.totalArea,
              price: item.prices?.USD
                ? `$${item.prices.USD.toLocaleString()}`
                : item.prices?.AZN
                ? `₼${item.prices.AZN.toLocaleString()}`
                : "",
              slug: item.slug,
              image: (item.coverImage || item.mainImage)?.url
                ? (item.coverImage || item.mainImage)!.url.startsWith("http")
                  ? (item.coverImage || item.mainImage)!.url
                  : `${apiUrl}${(item.coverImage || item.mainImage)!.url}`
                : undefined,
            }))
          );
        } else {
          setLayouts([]);
          setActiveCategorySlug(usedSlug);
        }
      } catch {
        setLayouts([]);
        setActiveCategorySlug(categorySlug || "");
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
