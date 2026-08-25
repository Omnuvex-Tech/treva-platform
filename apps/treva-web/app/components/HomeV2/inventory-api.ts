import type { InventoryCard } from "./data";

const TREVA_API = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";

type ApiUnit = {
    id?: string;
    slug?: string;
    rooms?: number;
    totalArea?: number;
    prices?: Record<string, number>;
    mainImage?: { url?: string } | null;
    coverImage?: { url?: string } | null;
    category?: { title?: string; name?: string; developerBrand?: string } | null;
    house?: { title?: string; name?: string } | null;
    floor?: number;
};

/** "396000" -> "396.000$" — dot grouping, matching the design. */
function formatPrice(prices: Record<string, number> | undefined): string {
    const usd = prices?.USD ?? prices?.AZN;
    if (typeof usd !== "number") return "";
    const suffix = prices?.USD ? "$" : " AZN";
    return `${Math.round(usd).toLocaleString("de-DE")}${suffix}`;
}

/** Trailing ".0" reads wrong on a spec line, but "61.2 m²" must survive. */
function formatArea(area: number | undefined): string {
    if (typeof area !== "number") return "";
    return `${Number.isInteger(area) ? area : area.toFixed(1)} m²`;
}

function toCard(unit: ApiUnit, index: number): InventoryCard | null {
    const image = unit.mainImage?.url || unit.coverImage?.url;
    if (!image) return null;

    return {
        id: unit.id || unit.slug || `unit-${index}`,
        project: unit.category?.title || unit.category?.name || "",
        developer: unit.category?.developerBrand || unit.house?.title || unit.house?.name || "",
        image,
        price: formatPrice(unit.prices),
        rooms: unit.rooms ? String(unit.rooms) : "",
        area: formatArea(unit.totalArea),
        building: unit.house?.title || unit.house?.name || "",
        floor: typeof unit.floor === "number" ? String(unit.floor) : "",
        href: unit.slug ? `/off-plan/${unit.slug}` : undefined,
    };
}

/**
 * Three units for the home page Inventory strip.
 *
 * Returns an empty array on any failure so the caller can fall back to the
 * seed cards — the home page must never fail to render because the treva-api
 * is down.
 */
export async function getHomeInventory(limit = 3): Promise<InventoryCard[]> {
    try {
        const res = await fetch(`${TREVA_API}/unit-layouts?limit=${limit}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiUnit[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        if (!Array.isArray(list)) return [];

        return list
            .slice(0, limit)
            .map(toCard)
            .filter((card): card is InventoryCard => card !== null);
    } catch {
        return [];
    }
}
