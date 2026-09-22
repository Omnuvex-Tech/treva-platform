import type { MetadataRoute } from "next";
import { project } from "@/config/project";

/**
 * XML sitemap for the public site, served at /sitemap.xml.
 *
 * Next.js does not generate one on its own — without this file the route 404s,
 * which is why the site had no sitemap at all until now.
 *
 * Regenerated at most once an hour; the dynamic sections (off-plan units,
 * resale listings, projects, Pulse articles/authors) are pulled fresh from the
 * same APIs the pages themselves use. If an API is unreachable that section is
 * simply omitted rather than failing the whole sitemap.
 */
export const revalidate = 3600;

const BASE = project.url.replace(/\/+$/, "");
const LOCALES = project.staticLanguages.map((lang) => lang.code);
const DEFAULT_LOCALE = project.defLang;

const CMS_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021").replace(/\/+$/, "");
const TREVA_API = (process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1").replace(/\/+$/, "");

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = SitemapEntry["changeFrequency"];

interface EntryOptions {
    lastModified?: string | Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
}

/**
 * One sitemap entry for a locale-agnostic path (e.g. "/projects/foo").
 * The canonical URL is the default-locale one; every locale is listed as an
 * hreflang alternate so Google serves the right language per user.
 */
function entry(path: string, options: EntryOptions = {}): SitemapEntry {
    const clean = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;

    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
        languages[locale] = `${BASE}/${locale}${clean}`;
    }
    languages["x-default"] = `${BASE}/${DEFAULT_LOCALE}${clean}`;

    return {
        url: `${BASE}/${DEFAULT_LOCALE}${clean}`,
        lastModified: options.lastModified ?? new Date(),
        changeFrequency: options.changeFrequency ?? "weekly",
        priority: options.priority ?? 0.6,
        alternates: { languages },
    };
}

async function safeJson<T>(url: string, fallback: T): Promise<T> {
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) return fallback;
        return (await res.json()) as T;
    } catch {
        return fallback;
    }
}

function asArray(raw: unknown): any[] {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj.value)) return obj.value;
        if (Array.isArray(obj.data)) return obj.data;
    }
    return [];
}

async function projectSlugs(): Promise<string[]> {
    const raw = await safeJson<unknown>(`${CMS_API}/layihelerimiz/categories/visible`, []);
    return asArray(raw)
        .map((item) => item?.slug)
        .filter((slug): slug is string => Boolean(slug));
}

async function pulseArticleSlugs(): Promise<string[]> {
    const raw = await safeJson<unknown>(`${CMS_API}/pulse/articles?limit=1000&fields=summary`, []);
    return asArray(raw)
        .map((item) => item?.slug)
        .filter((slug): slug is string => Boolean(slug));
}

async function pulseAuthorSlugs(): Promise<string[]> {
    const raw = await safeJson<unknown>(`${CMS_API}/pulse/authors`, []);
    return asArray(raw)
        .map((item) => item?.slug)
        .filter((slug): slug is string => Boolean(slug));
}

interface TrevaListItem {
    slug?: string;
    updatedAt?: string;
    unitTypeOption?: { value?: string } | null;
    realEstateType?: string | null;
}

/** Walk a paginated treva-api list endpoint and collect every item. */
async function trevaList(pathWithQuery: string, maxPages = 15): Promise<TrevaListItem[]> {
    const sep = pathWithQuery.includes("?") ? "&" : "?";
    const pageUrl = (page: number) => `${TREVA_API}${pathWithQuery}${sep}page=${page}&limit=1000`;

    const first = await safeJson<any>(pageUrl(1), null);
    const items: TrevaListItem[] = Array.isArray(first?.data) ? first.data : [];
    if (!items.length) return [];

    const totalPages = Math.min(Number(first?.pagination?.totalPages) || 1, maxPages);
    for (let page = 2; page <= totalPages; page++) {
        const next = await safeJson<any>(pageUrl(page), null);
        if (Array.isArray(next?.data)) items.push(...next.data);
    }
    return items;
}

function isParking(item: TrevaListItem): boolean {
    const type = (item.unitTypeOption?.value || item.realEstateType || "").toLowerCase();
    return type === "parking";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticEntries: MetadataRoute.Sitemap = [
        entry("/", { changeFrequency: "daily", priority: 1 }),
        entry("/off-plan", { changeFrequency: "daily", priority: 0.9 }),
        entry("/resale", { changeFrequency: "daily", priority: 0.9 }),
        entry("/projects", { changeFrequency: "weekly", priority: 0.9 }),
        entry("/developers", { changeFrequency: "monthly", priority: 0.7 }),
        entry("/brokers", { changeFrequency: "monthly", priority: 0.7 }),
        entry("/pulse", { changeFrequency: "daily", priority: 0.7 }),
        entry("/credit", { changeFrequency: "monthly", priority: 0.6 }),
        entry("/contact", { changeFrequency: "yearly", priority: 0.5 }),
        entry("/about-us", { changeFrequency: "yearly", priority: 0.5 }),
        entry("/compare", { changeFrequency: "monthly", priority: 0.3 }),
        entry("/wishlist", { changeFrequency: "monthly", priority: 0.3 }),
        entry("/privacy-policy", { changeFrequency: "yearly", priority: 0.3 }),
    ];

    const [projects, offPlan, resale, articles, authors] = await Promise.all([
        projectSlugs(),
        trevaList("/unit-layouts"),
        trevaList("/apartments?archived=false"),
        pulseArticleSlugs(),
        pulseAuthorSlugs(),
    ]);

    const toDate = (value?: string) => {
        if (!value) return undefined;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    };

    const dynamicEntries: MetadataRoute.Sitemap = [
        ...projects.map((slug) =>
            entry(`/projects/${slug}`, { changeFrequency: "weekly", priority: 0.8 }),
        ),
        ...offPlan
            .filter((item) => item.slug && !isParking(item))
            .map((item) =>
                entry(`/off-plan/${item.slug}`, {
                    lastModified: toDate(item.updatedAt),
                    changeFrequency: "weekly",
                    priority: 0.7,
                }),
            ),
        ...resale
            .filter((item) => item.slug)
            .map((item) =>
                entry(`/resale/${item.slug}`, {
                    lastModified: toDate(item.updatedAt),
                    changeFrequency: "weekly",
                    priority: 0.7,
                }),
            ),
        ...articles.map((slug) =>
            entry(`/pulse/${slug}`, { changeFrequency: "monthly", priority: 0.6 }),
        ),
        ...authors.map((slug) =>
            entry(`/authors/${slug}`, { changeFrequency: "monthly", priority: 0.4 }),
        ),
    ];

    return [...staticEntries, ...dynamicEntries];
}
