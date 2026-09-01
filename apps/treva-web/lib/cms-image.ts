/**
 * Route a ready-to-use image URL through Next's image optimizer (`/_next/image`
 * → sharp: resize + WebP/AVIF), for the places that render a plain `<img>`
 * rather than `next/image` — Swiper slides, CSS-cover fills and the lightbox,
 * where `fill` would fight the existing layout or carousel.
 *
 * `next/image` is still the right tool for a fresh `<img>`; this is for the
 * ones already wired into a carousel or a zoom handler, where swapping the
 * element is riskier than pointing its `src`/`srcSet` at the optimizer.
 *
 * Constraints baked in so a bad value can't 400 the image:
 *  - quality is pinned to 75 (Next 16 rejects any other unless
 *    `images.qualities` is set, and it is not)
 *  - widths are drawn from Next's default `deviceSizes` + `imageSizes`; the
 *    optimizer refuses any `w` outside that union.
 */

// Next defaults: deviceSizes ∪ imageSizes, ascending. Anything outside 400s.
const ALLOWED = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// The rungs a normal photo actually needs — a sensible srcSet without 16 entries.
const RUNGS = [384, 640, 828, 1080, 1200, 1920];

type Opts = {
    /** Widest the element is ever painted (device-pixel-ratio included). Snapped
        up to the nearest size the optimizer allows; defaults to 1920. */
    max?: number;
};

/** Spread onto an `<img>`: `<img {...cmsImage(src)} sizes="…" loading="lazy" />`. */
export function cmsImage(src: string, { max = 1920 }: Opts = {}): {
    src: string;
    srcSet?: string;
} {
    if (!src || src.startsWith("data:") || /\.svg(\?|$)/i.test(src)) {
        return { src };
    }

    const cap = ALLOWED.find((w) => w >= max) ?? 3840;
    const at = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

    const widths = RUNGS.filter((w) => w < cap);
    widths.push(cap);

    return {
        src: at(cap),
        srcSet: widths.map((w) => `${at(w)} ${w}w`).join(", "),
    };
}
