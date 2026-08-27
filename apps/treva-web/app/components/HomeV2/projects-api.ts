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
 * Capped at six, same as the home grid (Figma node 457:10745) and the same
 * reason: the "see all" tile is what /projects is for.
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
