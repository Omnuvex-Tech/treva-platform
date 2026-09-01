import { getTrevaAssetUrl } from "@/lib/asset-url";
import type { InventoryCard } from "./data";

const TREVA_API = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";

/**
 * Manat is pegged to the dollar. The off-plan feed carries USD only, so the
 * credit calculator converts at the peg to quote in AZN.
 */
const USD_TO_AZN = 1.7;

type ApiUnit = {
    id?: string;
    slug?: string;
    rooms?: number;
    totalArea?: number;
    prices?: Record<string, number>;
    mainImage?: { url?: string } | null;
    coverImage?: { url?: string } | null;
    category?: { slug?: string; title?: string; name?: string; developerBrand?: string } | null;
    house?: { title?: string; name?: string } | null;
    floor?: number;
    /** "Apartment" | "parking" | "Commercial" | "Villa" | "Townhouse" — the
        credit calculator quotes on apartments only. */
    realEstateType?: string;
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
        // `mainImage.url`/`coverImage.url` come back as paths relative to the
        // treva-api, not full URLs — unresolved, next/image requests them
        // against treva-web's own origin and 404s. Resale's flat `image`
        // field (below) gets the same treatment.
        image: getTrevaAssetUrl(image),
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
        image: getTrevaAssetUrl(apartment.image),
        price: formatResalePrice(apartment),
        rooms: apartment.roomCount ? String(apartment.roomCount) : "",
        area: formatArea(apartment.area),
        href: apartment.slug ? `/resale/${apartment.slug}` : undefined,
    };
}

/**
 * Over-fetch multiplier for both listings below: `toCard`/`toResaleCard`
 * drop anything with no image, and imageless units are not spread evenly —
 * in practice they cluster in the first few dozen records, so a plain
 * `?limit=N` (or even `4*N`) routinely came back short (six requested, three
 * survived, sometimes zero). 60 comfortably clears that cluster in the
 * current data; trimming to the real `limit` happens after the filter.
 */
const FETCH_BUFFER = 60;

/**
 * Off-plan units for the home page Inventory strip.
 *
 * Returns an empty array on any failure so the caller can fall back to the
 * seed cards — the home page must never fail to render because the treva-api
 * is down.
 */
export async function getHomeInventory(limit = 3): Promise<InventoryCard[]> {
    try {
        const res = await fetch(`${TREVA_API}/unit-layouts?limit=${Math.max(limit * 4, FETCH_BUFFER)}&archived=false`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiUnit[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        if (!Array.isArray(list)) return [];

        return list
            .map(toCard)
            .filter((card): card is InventoryCard => card !== null)
            .slice(0, limit);
    } catch {
        return [];
    }
}

/**
 * Resale apartments for the same strip's other tab — a different
 * endpoint/model entirely (see `ApiApartment` above), not a filtered view of
 * `getHomeInventory`. `archived: false` matches the default the resale
 * listing page itself applies. Same over-fetch-then-trim reasoning as
 * `getHomeInventory` above.
 */
export async function getHomeResale(limit = 3): Promise<InventoryCard[]> {
    try {
        const res = await fetch(`${TREVA_API}/apartments?limit=${Math.max(limit * 4, FETCH_BUFFER)}&archived=false`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];

        const raw = await res.json();
        const list: ApiApartment[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        if (!Array.isArray(list)) return [];

        return list
            .map(toResaleCard)
            .filter((card): card is InventoryCard => card !== null)
            .slice(0, limit);
    } catch {
        return [];
    }
}

/**
 * One inventory unit reduced to the six facts the credit calculator needs.
 *
 * The calculator does not show units — it narrows the inventory down to a
 * single one through its dropdowns and then divides that unit's price — so it
 * needs neither the images nor the formatted strings `InventoryCard` carries.
 * Numbers stay numbers here: the arithmetic happens in the component, and
 * formatting only at the point of display.
 */
export type CreditUnit = {
    id: string;
    projectSlug: string;
    projectTitle: string;
    rooms: number | null;
    area: number | null;
    floor: number | null;
    priceUsd: number | null;
    priceAzn: number | null;
};

function toCreditUnit(unit: ApiUnit, index: number): CreditUnit | null {
    const priceUsd = unit.prices?.USD ?? null;
    // The feed is USD-only in practice; fall back to the pegged conversion so
    // there is always an AZN figure — the calculator quotes in manat.
    const priceAzn = unit.prices?.AZN ?? (priceUsd !== null ? priceUsd * USD_TO_AZN : null);
    // A unit with no price cannot be paid off in instalments, so it would only
    // ever widen the dropdowns into dead ends.
    if (priceUsd === null && priceAzn === null) return null;

    return {
        id: unit.id || unit.slug || `credit-unit-${index}`,
        projectSlug: unit.category?.slug || "",
        projectTitle: unit.category?.title || unit.category?.name || "",
        rooms: typeof unit.rooms === "number" ? unit.rooms : null,
        area: typeof unit.totalArea === "number" ? unit.totalArea : null,
        floor: typeof unit.floor === "number" ? unit.floor : null,
        priceUsd,
        priceAzn,
    };
}

/**
 * Every off-plan apartment the credit calculator is allowed to quote on.
 *
 * Fetched whole rather than filtered per dropdown: the calculator's selects
 * cascade — picking a project has to narrow the room counts, which narrows the
 * areas, and so on — and driving that from the server would mean a round trip
 * per keystroke. The feed is ~5000 rows, so `limit` is set above that to pull
 * it in one request; raise it again if the inventory outgrows this.
 *
 * Only `realEstateType === "Apartment"` is kept — parking, commercial, villas
 * and townhouses are not what "off-plan apartment" means, and their room/area
 * numbers would only pollute the dropdowns. `sold` units are excluded too:
 * they cannot be bought. `reserved` stays — a reservation lapses.
 *
 * The full feed is ~20MB, over Next's 2MB data-cache ceiling, so it re-fetches
 * on every revalidation rather than being cached. Off-plan pricing and stock
 * move slowly, so the window is an hour, not the minute the smaller feeds use.
 *
 * The result is then deduped to one row per (project, rooms, area, floor): the
 * calculator only ever reads the first unit a full selection resolves to, so
 * the thousand-plus duplicate rows behind each combination are dead weight in
 * the payload shipped to the client component. ~3500 apartments collapse to
 * ~1700 combinations.
 */
export async function getCreditUnits(): Promise<CreditUnit[]> {
    try {
        const res = await fetch(`${TREVA_API}/unit-layouts?limit=5000&archived=false`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];

        const raw = await res.json();
        const list: (ApiUnit & { status?: string })[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        if (!Array.isArray(list)) return [];

        const seen = new Set<string>();
        return list
            .filter((unit) => unit.status !== "sold")
            .filter((unit) => unit.realEstateType === "Apartment")
            .map(toCreditUnit)
            .filter((unit): unit is CreditUnit => unit !== null)
            .filter((unit) => {
                const key = `${unit.projectSlug}|${unit.rooms}|${unit.area}|${unit.floor}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    } catch {
        return [];
    }
}
