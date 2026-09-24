import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

export interface AssetIconProps {
    /** Path under /public to an SVG exported from Figma. */
    src: string;
    /** Rendered box in px; the glyph is stretched to fill it, as Figma draws it. */
    size: number;
    /**
     * For an export that is only the glyph, not its box: the glyph's own size
     * in px, drawn centred in `size` instead of stretched across it. Figma
     * insets some icons inside their frame (the sidebar key, 10.92px in 14),
     * and the SVG it exports carries no padding for that.
     */
    glyph?: { width: number; height: number };
    className?: string;
}

/**
 * An icon drawn from its exported Figma SVG rather than from an icon library.
 *
 * The design's glyphs come from the Hugeicons Figma pack, which differs from
 * the npm package line for line, so the SVG bytes are committed as-is. They are
 * applied as a mask over `currentColor` so the one asset can take any ink —
 * the active nav row turns the same glyph white.
 */
export function AssetIcon({ src, size, glyph, className }: AssetIconProps) {
    const fit = glyph ? `${glyph.width}px ${glyph.height}px` : "100% 100%";
    const mask = `url("${src}") center / ${fit} no-repeat`;
    const style: CSSProperties = {
        width: size,
        height: size,
        mask,
        WebkitMask: mask,
    };

    return <span aria-hidden className={cn("inline-block shrink-0 bg-current", className)} style={style} />;
}
