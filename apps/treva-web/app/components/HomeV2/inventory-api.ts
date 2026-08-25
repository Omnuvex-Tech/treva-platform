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

/**
 * Resale (`/apartments`) is a wholly separate model from off-plan
 * (`/unit-layouts`) — its own table, its own admin, its own listing page —
 * so the shape barely overlaps: a flat `image` string instead of
 * `mainImage`/`coverImage`, `priceTotal` (per `resale.types.ts`'s
 * `ResaleApartment`) instead of a currency-keyed `prices` map, `roomCount`
 * instead of `rooms`, and no "category/house" pair — `apartmentType` and
 * `locationTitle` are the closest equivalents.
 */
type ApiApartment = {
    id?: string;
    slug?: string;
    image?: string;
    roomCount?: number;
    area?: number;
    priceTotal?: number;
    locationTitle?: string;
    apartmentType?: { title?: string } | null;
    prices?: { priceTotal?: number; currency?: { value?: string } | null }[];
};

/** "396000" -> "396.000$" — dot grouping, matching the design. */
function formatPrice(prices: Record<string, number> | undefined): string {
    const usd = prices?.USD ?? prices?.AZN;
    if (typeof usd !== "number") return "";
    const suffix = prices?.USD ? "$" : " AZN";
    return `${Math.round(usd).toLocaleString("de-DE")}${suffix}`;
}

/** Same "396 000 AZN" grouping the resale listing page itself uses. */
function formatResalePrice(apartment: ApiApartment): string {
    const entry = apartment.prices?.[0];
    const amount = entry?.priceTotal ?? apartment.priceTotal;
    if (typeof amount !== "number") return "";
    const currency = entry?.currency?.value || "AZN";
    return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${currency}`;
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

function toResaleCard(apartment: ApiApartment, index: number): InventoryCard | null {
    if (!apartment.image) return null;

    return {
        id: apartment.id || apartment.slug || `resale-${index}`,
        project: apartment.locationTitle || apartment.apartmentType?.title || "",
        developer: apartment.apartmentType?.title || "",
        image: apartment.image,
        price: formatResalePrice(apartment),
        rooms: apartment.roomCount ? String(apartment.roomCount) : "",
        area: formatArea(apartment.area),
        href: apartment.slug ? `/resale/${apartment.slug}` : undefined,
    };
}

/**
 * Three off-plan units for the home page Inventory strip.
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

/**
 * Three resale apartments for the same strip's other tab — a different
 * endpoint/model entirely (see `ApiApartment` above), not a filtered view of
 * `getHomeInventory`. `archived: false` matches the default the resale
 * listing page itself applies.
 */
export async function getHomeResale(limit = 3): Promise<InventoryCard[]> {
    try {
        const res = await fetch(`${TREVA_API}/apartments?limit=${limit}&archived=false`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiApartment[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        if (!Array.isArray(list)) return [];

        return list
            .slice(0, limit)
            .map(toResaleCard)
            .filter((card): card is InventoryCard => card !== null);
    } catch {
        return [];
    }
}
