import { projectCards, type ProjectCard } from "./data";

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

type LocalizedValue = string | { az?: string; en?: string; ru?: string } | null;

type ApiCategory = {
    slug?: string;
    title?: LocalizedValue;
    brand?: LocalizedValue;
    /** The CMS "Şəkil" slot — the cover for a project with no static artwork. */
    image?: string | null;
    /** The CMS "Brend şəkli" slot — the glyph next to the developer name. */
    brandImage?: string | null;
    /** The CMS "GIF / Video" slot — a .gif, .mp4 or .webm, or null. */
    gif?: string | null;
    description?: LocalizedValue;
    order?: number;
};

function toAbsUrl(path: string): string {
    if (!path) return "";
    return path.startsWith("http") ? path : `${CMS_API}${path}`;
}

function localized(value: LocalizedValue | undefined, locale: string): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    const map = value as Record<string, string | undefined>;
    return map[locale] || map.az || map.en || map.ru || "";
}

/** "Panorama by ELIE SAAB" and "panorama-by-elie-saab" both -> "panoramabyeliesaab". */
function normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Home page project cards — the six-card grid (Figma node 457:10745), in the
 * design's own order and with the design's own price/area copy.
 *
 * The seed array `projectCards` is the source of truth for everything on the
 * card — slots, order, title, developer, price, area: all of it is the
 * design's own copy. It is deliberately *not* cross-checked against the CMS's
 * `title`/`brand` fields, which today just restate the project's own name
 * ("ELIE SAAB", "Sabah Towers", …) rather than the curated partner line the
 * design shows ("DreamFest Arena", "Lighthouse Mall", …); overriding with
 * those would drift the grid away from Figma, the opposite of the point.
 * The one thing genuinely an admin's to fill day to day — the hover clip —
 * still comes from the CMS "GIF / Video" slot when a project has one.
 */
export async function getProjectCards(locale = "az"): Promise<ProjectCard[]> {
    let list: ApiCategory[] = [];
    try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`, {
            next: { revalidate: 60 },
        });
        if (res.ok) {
            const raw = await res.json();
            list = Array.isArray(raw) ? raw : (raw?.value ?? []);
        }
    } catch {
        list = [];
    }

    const bySlug = new Map(
        list.filter((c): c is ApiCategory & { slug: string } => Boolean(c.slug)).map((c) => [normalizeKey(c.slug), c]),
    );

    return projectCards.map((seed) => {
        const gif = bySlug.get(normalizeKey(seed.slug))?.gif;
        return gif ? { ...seed, video: toAbsUrl(gif) } : seed;
    });
}

export type NavProject = { slug: string; title: string; desc: string; image: string };

/**
 * Header "Projects" dropdown — desktop mega-menu and mobile disclosure.
 *
 * Unlike `getProjectCards`, this skips the per-project inventory round-trip
 * (the header renders on every page) and every thumbnail is the CMS "Şəkil"
 * cover, not the hand-framed static render: the render is a cut-out on
 * transparency, so used bare — without the sky it sits on everywhere else —
 * it renders as blank. Capped at six, same as the home grid (Figma node
 * 457:10745) and the same reason: the "see all" tile is what /projects is for.
 *
 * `desc` is the CMS blurb; a project with none falls back to its developer,
 * the next best one-liner, the same as the card showed before the CMS had a
 * description field at all.
 */
export async function getNavProjects(locale = "az"): Promise<NavProject[]> {
    try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiCategory[] = Array.isArray(raw) ? raw : (raw?.value ?? []);

        return list
            .filter((category): category is ApiCategory & { slug: string } => Boolean(category.slug))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .slice(0, 6)
            .map((category) => ({
                slug: category.slug,
                title: localized(category.title, locale),
                desc: localized(category.description, locale) || localized(category.brand, locale),
                image: toAbsUrl(category.image ?? ""),
            }));
    } catch {
        return [];
    }
}
