"use client";

import { useQuery } from "@tanstack/react-query";
import { trevaApi } from "@/lib/api";

/**
 * Inventory admin-də obyektin "Location" tabında saxlanan məlumat
 * (Category.locationTitle / locationUrl / locationGoogleMapsUrl).
 */
export interface CategoryLocation {
  locationTitle?: string | null;
  locationUrl?: string | null;
  locationGoogleMapsUrl?: string | null;
}

/**
 * Layihənin xəritəsini treva-api-dən (inventory admin-in yazdığı yerdən) çəkir.
 *
 * CMS-dəki `categorySlug` ilə inventory-dəki category slug həmişə üst-üstə
 * düşmür — ona görə bir neçə namizəd slug sırayla yoxlanılır və xəritəsi olan
 * ilk nəticə qaytarılır.
 */
export function useCategoryLocation(slugs: Array<string | undefined | null>) {
  const candidates = Array.from(
    new Set(
      slugs
        .map((slug) => String(slug || "").trim())
        .filter((slug) => slug.length > 0),
    ),
  );

  return useQuery({
    queryKey: ["category-location", candidates],
    enabled: candidates.length > 0,
    queryFn: async (): Promise<CategoryLocation | null> => {
      for (const slug of candidates) {
        const response = await trevaApi.get<CategoryLocation>(
          `/categories/slug/${encodeURIComponent(slug)}`,
        );
        const data = response.data;
        if (data?.locationGoogleMapsUrl || data?.locationUrl) return data;
      }
      return null;
    },
  });
}
