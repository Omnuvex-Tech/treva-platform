import { projectCards, type ProjectCard } from "./data";

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

type ApiCategory = {
    slug?: string;
    /** The CMS "GIF / Video" slot — a .gif, .mp4 or .webm, or null. */
    gif?: string | null;
};

function toAbsUrl(path: string): string {
    if (!path) return "";
    return path.startsWith("http") ? path : `${CMS_API}${path}`;
}

/**
 * Home page project cards, with the hover media the CMS holds.
 *
 * The CMS is not the source of these cards. The V2 design gives every card data
 * the `layihelerimiz` model has no field for — the hand-framed crop, the sky
 * layer under the cut-out, the price and the area range — so the six seed cards
 * in data.ts stay as they are. Only the hover clip is taken from the CMS:
 * whatever an admin uploads into a project's "GIF / Video" slot replaces that
 * card's placeholder clip, matched on slug. A project without one keeps the
 * placeholder, and an unreachable CMS leaves every card untouched — the home
 * page must never fail to render because the admin API is down.
 */
export async function getProjectCards(): Promise<ProjectCard[]> {
    try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return projectCards;

        const raw = await res.json();
        const list: ApiCategory[] = Array.isArray(raw) ? raw : (raw?.value ?? []);

        const mediaBySlug = new Map<string, string>();
        for (const category of list) {
            if (category.slug && category.gif) {
                mediaBySlug.set(category.slug, toAbsUrl(category.gif));
            }
        }
        if (mediaBySlug.size === 0) return projectCards;

        return projectCards.map((card) => {
            const media = mediaBySlug.get(card.slug);
            return media ? { ...card, video: media } : card;
        });
    } catch {
        return projectCards;
    }
}
