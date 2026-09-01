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

export type NavProject = { slug: string; title: string; desc: string; image: string };

/**
 * Header "Projects" dropdown — desktop mega-menu and mobile disclosure.
 *
 * This is the one project list on the page that is CMS-fed: the header has to
 * name whatever projects actually exist, so it cannot be seeded. The home grid
 * next door is the opposite — deliberately static, straight off `projectCards`
 * (see ProjectsV2). Every thumbnail here is the CMS "Şəkil" cover, not the
 * hand-framed static render: the render is a cut-out on transparency, so used
 * bare — without the sky it sits on everywhere else — it renders as blank.
 * Capped at seven — the 4x2 grid's eighth cell is the "see all" tile — so every
 * project beyond that is what /projects is for.
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
            .slice(0, 7)
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

export type FilterProject = { slug: string; title: string; image: string };

/**
 * The "Project" option list for the home search panel's dropdown (SearchPanelV2).
 *
 * Same CMS source as the header menu, and the thumbnail is the same CMS "Şəkil"
 * cover — not the `/images/thumbs/*` crops the panel used to hard-code, which
 * only existed for the seed slugs and 404'd for every CMS project without one
 * (e.g. `marina-village`, `sabah-residence`). Unlike the header menu this is a
 * filter, not a teaser, so it is not capped at six — every visible project has
 * to be selectable.
 *
 * Returns `[]` if the CMS is unreachable; the caller falls back to the static
 * `projectCards` so the dropdown is never empty.
 */
export async function getFilterProjects(locale = "az"): Promise<FilterProject[]> {
    try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiCategory[] = Array.isArray(raw) ? raw : (raw?.value ?? []);

        return list
            .filter((category): category is ApiCategory & { slug: string } => Boolean(category.slug))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((category) => ({
                slug: category.slug,
                title: localized(category.title, locale),
                image: toAbsUrl(category.image ?? ""),
            }));
    } catch {
        return [];
    }
}

/**
 * The project grid, keyed off the CMS.
 *
 * The CMS is the source of truth for *which* projects exist and in *what*
 * order. The static `projectCards` are a skin on top of it: where a CMS
 * project's slug matches a seed card, that hand-framed card — its cut-out
 * render, sky, hover clip, price and area — is what renders. A CMS project
 * with no matching seed still shows, drawn from its CMS "Şəkil" cover and
 * brand. A seed card whose slug the CMS does not list is dropped.
 *
 * If the CMS is unreachable the full static seed is returned unchanged, so the
 * grid never comes back empty.
 *
 * Revalidated every 5 minutes: the projects route is statically generated now
 * that it no longer reads `?v=2`, so this is what lets a newly published CMS
 * project appear without a redeploy.
 */
export async function getProjectCards(locale = "az"): Promise<ProjectCard[]> {
    try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return projectCards;

        const raw = await res.json();
        const list: ApiCategory[] = Array.isArray(raw) ? raw : (raw?.value ?? []);

        const merged = list
            .filter((category): category is ApiCategory & { slug: string } => Boolean(category.slug))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((category): ProjectCard => {
                const seed = projectCards.find((card) => card.slug === category.slug);
                if (seed) return seed;

                return {
                    slug: category.slug,
                    title: localized(category.title, locale),
                    developer: localized(category.brand, locale),
                    icon: toAbsUrl(category.brandImage ?? "") || undefined,
                    image: toAbsUrl(category.image ?? ""),
                    startingFrom: "",
                    areaRange: "",
                };
            });

        return merged.length ? merged : projectCards;
    } catch {
        return projectCards;
    }
}
