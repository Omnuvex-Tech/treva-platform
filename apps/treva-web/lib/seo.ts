import type { Metadata } from "next";

/**
 * CMS-in "SEO" bölməsindən (PageMeta) statik və dinamik səhifələr üçün meta
 * teqləri və JSON-LD schema-nı çəkən köməkçilər.
 *
 * Admin paneldə (cms-web `/seo`) doldurulan sahələr cms-api-nin açıq
 * `GET /page-meta/:pageKey` endpoint-i ilə gəlir:
 *   - statik səhifə açarları: "home", "about-us", "projects", "off-plan",
 *     "resale", "brokers", "developers", "pulse", "contact", "privacy-policy"
 *   - dinamik detal açarları: "author:<id>", "project:<id>", "pulse:<id>"
 */

const CMS_API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10021";

/** OG şəkli üçün fallback — səhifə üçün ayrıca verilməyibsə. */
const DEFAULT_OG_IMAGE =
  "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687dee7f7f77ffad0c85b58e_Open%20Graph.jpg";

type Locale = "az" | "en" | "ru";

type LocalizedText = string | Partial<Record<Locale, string>> | null | undefined;

export interface PageMetaRecord {
  pageKey: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  seoKeywords: LocalizedText;
  schema: Partial<Record<Locale, Record<string, unknown>>> | null;
}

export interface SeoFallback {
  title?: string;
  description?: string;
  keywords?: string | string[];
  ogImage?: string;
}

/** Çoxdilli dəyərdən uyğun dili seçir, boşdursa digər dillərə keçir. */
export function pickLocalized(value: unknown, locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object") return "";
  const map = value as Record<string, unknown>;
  const order = [locale, "az", "en", "ru"];
  for (const code of order) {
    const v = map[code];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

async function fetchJson<T>(url: string, tags: string[] = []): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300, tags } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === "null") return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Cache tag-ları — admin "SEO"-nu yadda saxlayanda cms-api
 * `POST /api/revalidate` ilə bunları təzələyir (bax `app/api/revalidate`).
 */
export function pageMetaTags(pageKey: string): string[] {
  return ["page-meta", `page-meta:${pageKey}`];
}

/** `GET /page-meta/:pageKey` — admin-də saxlanmış meta + schema. */
export function fetchPageMeta(pageKey: string): Promise<PageMetaRecord | null> {
  return fetchJson<PageMetaRecord>(
    `${CMS_API}/page-meta/${pageKey}`,
    pageMetaTags(pageKey),
  );
}

/**
 * Səhifə üçün Next `Metadata` obyekti qurur. Admin dəyəri boşdursa
 * `fallback`-a keçir (məs. mövcud tərcümə mətnləri).
 */
export async function buildPageMetadata(opts: {
  pageKey: string;
  locale: string;
  fallback?: SeoFallback;
}): Promise<Metadata> {
  const { pageKey, locale, fallback } = opts;
  const record = await fetchPageMeta(pageKey);

  const title =
    pickLocalized(record?.seoTitle, locale) || fallback?.title || undefined;
  const description =
    pickLocalized(record?.seoDescription, locale) ||
    fallback?.description ||
    undefined;

  const keywordsRaw = pickLocalized(record?.seoKeywords, locale);
  const keywords = keywordsRaw
    ? keywordsRaw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : fallback?.keywords;

  const image = fallback?.ogImage || DEFAULT_OG_IMAGE;

  const metadata: Metadata = {};
  if (title) metadata.title = title;
  if (description) metadata.description = description;
  if (keywords && (Array.isArray(keywords) ? keywords.length : true)) {
    metadata.keywords = keywords;
  }

  metadata.openGraph = {
    type: "website",
    locale,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    images: [{ url: image, width: 1200, height: 630, alt: "TREVA Real Estate" }],
  };
  metadata.twitter = {
    card: "summary_large_image",
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    images: [image],
  };

  return metadata;
}

/**
 * Səhifənin JSON-LD schema-sını qaytarır: əvvəlcə admin-də saxlanmış,
 * yoxdursa cms-api-nin generasiya etdiyi (`/schema/preview`).
 */
export async function resolvePageSchema(
  pageKey: string,
  locale: string,
): Promise<Record<string, unknown> | null> {
  const record = await fetchPageMeta(pageKey);
  const saved = record?.schema;
  if (saved) {
    const picked =
      saved[locale as Locale] || saved.az || saved.en || saved.ru || null;
    if (picked && Object.keys(picked).length > 0) return picked;
  }

  const generated = await fetchJson<Record<string, Record<string, unknown>>>(
    `${CMS_API}/page-meta/${pageKey}/schema/preview`,
    pageMetaTags(pageKey),
  );
  if (!generated) return null;
  return generated[locale] || generated.az || generated.en || generated.ru || null;
}
