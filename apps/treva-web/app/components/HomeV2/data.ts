/**
 * Home V2 — static seed data.
 *
 * The design (Figma "Treva Real Estate" › Home, node 635-21025) was rebuilt from
 * screenshots. Copy + numbers below mirror the frames 1:1 so the page renders the
 * intended layout before the real endpoints are wired in. Every export here is
 * shaped like the API payload it will eventually be replaced by, so swapping in
 * `getProjects()` / `getUnits()` later is a props change, not a rewrite.
 */

export type Locale = "az" | "en" | "ru";

export type ProjectCard = {
    slug: string;
    title: string;
    developer: string;
    developerLogo?: string;
    /**
     * 24x24 glyph next to the developer name. Every card carries its own in the
     * Figma file; the ones still waiting on theirs fall back to a generic pin.
     */
    icon?: string;
    /**
     * The cover. In Figma this is a cut-out render on a transparent background,
     * which is what lets the tower break past the top of the card — see `sky`.
     * Cards still on a flat photo just fill the cover box edge to edge.
     */
    image: string;
    /**
     * Backdrop behind the whole card. The design layers a sky photo under the
     * cut-out, and the translucent footer sits on that same sky, so it is also
     * what gives each card its own tint. Without one the cover doubles as the
     * backdrop and the card reads as a plain photo.
     */
    sky?: string;
    /**
     * How the cover sits inside its 430x312 window, as the four percentages
     * Figma positions the fill with. Each card is framed by hand in the design,
     * so there is no formula to derive it — cards without one fall back to a
     * centred `cover`.
     */
    crop?: { width: number; height: number; left: number; top: number };
    /** Optional hover clip. Cards without one simply keep the still cover. */
    video?: string;
    startingFrom: string;
    areaRange: string;
};

export type InventoryCard = {
    id: string;
    project: string;
    developer: string;
    image: string;
    price: string;
    rooms: string;
    area: string;
    href?: string;
};

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    avatar: string;
    href: string;
};

export type NewsCard = {
    id: string;
    slug: string;
    title: string;
    date: string;
    category: string;
    image: string;
};

/**
 * Hover clips. `public/` holds eight .mp4 files but only these two are distinct
 * — the rest are byte-identical copies under assets/ and cdn-assets/. The Figma
 * file carries no downloadable footage (its card fills export as PNG only), so
 * every card is pointed at one of the two until the real per-project clips land,
 * and swapping them in is a one-line change per entry.
 */
const CLIP_CONSTRUCTION = "/6825d64025f8005ef1ddfc4c_68ca8e5a67ef60d728ebc041_video-transcode.mp4";
const CLIP_REEL = "/assets/treva-reel.mp4";

export const projectCards: ProjectCard[] = [
    {
        slug: "panorama-by-elie-saab",
        title: "Panorama by ELIE SAAB",
        developer: "DreamFest Arena",
        icon: "/images/features-pro/icons/dreamfest-arena.svg",
        image: "/images/features-pro/figma/panorama-building.png",
        sky: "/images/features-pro/figma/panorama-sky.jpg",
        crop: { width: 152.55, height: 118.27, left: -52.55, top: -18.27 },
        video: CLIP_CONSTRUCTION,
        startingFrom: "156.734$",
        areaRange: "43 m² - 431 m²",
    },
    {
        slug: "arabian-ranches",
        title: "Arabian Ranches",
        developer: "Dubai Autodrome",
        image: "/images/features-pro/arabian-cover.jpg",
        video: CLIP_REEL,
        startingFrom: "10.8570$",
        areaRange: "33 m² - 178 m²",
    },
    {
        slug: "sabah-towers",
        title: "Sabah Towers",
        developer: "Lighthouse Mall",
        image: "/images/features-pro/sabah-cover.png",
        video: CLIP_CONSTRUCTION,
        startingFrom: "88.954$",
        areaRange: "36 m² - 237 m²",
    },
    {
        slug: "brabus-island-baku",
        title: "Brabus İsland Baku",
        developer: "Nikki Beach",
        image: "/images/features-pro/brabus-cover.jpg",
        video: CLIP_REEL,
        startingFrom: "186.833$",
        areaRange: "42 m² - 266 m²",
    },
    {
        slug: "reportage-heights",
        title: "Reportage Heights",
        developer: "Sea Breeze Casino",
        image: "/images/features-pro/reportage-cover.jpg",
        video: CLIP_CONSTRUCTION,
        startingFrom: "85.864$",
        areaRange: "30 m² - 209 m²",
    },
    {
        slug: "mariana-village",
        title: "Mariana Village",
        developer: "Sea Breeze Marina",
        image: "/images/features-pro/marina-cover.jpg",
        video: CLIP_REEL,
        startingFrom: "203.744$",
        areaRange: "38 m² - 500 m²",
    },
];

/** Fallback only — the live list comes from `/unit-layouts` (see inventory-api.ts). */
export const inventoryCards: InventoryCard[] = [
    {
        id: "inv-1",
        project: "Panorama by ELIE SAAB",
        developer: "DreamFest Arena",
        image: "/images/features-pro/panorama-cover.png",
        price: "50.570$",
        rooms: "1",
        area: "48 m²",
    },
    {
        id: "inv-2",
        project: "Panorama by ELIE SAAB",
        developer: "DreamFest Arena",
        image: "/images/features-pro/reportage-cover.jpg",
        price: "137.088$",
        rooms: "1",
        area: "61.2 m²",
    },
    {
        id: "inv-3",
        project: "Panorama by ELIE SAAB",
        developer: "DreamFest Arena",
        image: "/images/features-pro/marina-cover.jpg",
        price: "225.254$",
        rooms: "2",
        area: "107.52 m²",
    },
];

export type PartnerLogo = {
    alt: string;
    src: string;
    /** Box the logo occupies inside the 240x160 tile, sized per logo in Figma. */
    width: number;
    height: number;
    /** Only Sea Breeze is cropped to its box; every other logo is fitted whole. */
    fit?: "cover";
};

/**
 * Partner logos, exported from Figma node 453:10703 and in the design's order.
 *
 * The old set came off the Webflow build, was one logo short (Megapolis) and
 * ran every mark at a single 40px height. The design gives each logo its own
 * box instead — a wordmark and a square emblem need different room — so the
 * dimensions below are per logo and not a shared rule. Assets are exported at
 * 2x their box.
 */
export const partnerLogos: PartnerLogo[] = [
    // Figma has this box at 98.75 tall; rounded because next/image writes the
    // value straight into the height attribute, which has to be an integer.
    { alt: "Sea Breeze", src: "/images/partners/sea-breeze.png", width: 158, height: 99, fit: "cover" },
    { alt: "Bazis", src: "/images/partners/bazis.png", width: 120, height: 120 },
    { alt: "Trident", src: "/images/partners/trident.png", width: 120, height: 120 },
    { alt: "SiG", src: "/images/partners/sig.png", width: 144, height: 72 },
    { alt: "RNS Estate", src: "/images/partners/rns-estate.png", width: 128, height: 128 },
    { alt: "Reportage Properties", src: "/images/partners/reportage.png", width: 176, height: 120 },
    { alt: "etagi.com", src: "/images/partners/etagi.png", width: 120, height: 120 },
    { alt: "Megapolis Estate", src: "/images/partners/megapolis.png", width: 161, height: 84 },
    { alt: "Best Home", src: "/images/partners/best-home.png", width: 164, height: 116 },
];

export const roomOptions = ["1", "2", "2st", "3", "3st", "3ct"];
