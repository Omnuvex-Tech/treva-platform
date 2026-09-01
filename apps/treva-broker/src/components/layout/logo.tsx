import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { HOME_ROUTE } from "@/config/routes";

/**
 * TREVA wordmark.
 *
 * Drawn as text rather than an <img> so it inherits the type scale. It has no
 * collapsed variant: the logo cell keeps its 280px width even when the rail
 * collapses (see LogoCell), so the full wordmark is always on screen. Swap in
 * the official SVG here when design exports it — no call site changes.
 */
export function Logo({ locale }: { locale: Locale }) {
    return (
        <Link
            href={HOME_ROUTE(locale)}
            className="inline-flex items-center gap-0.5 text-2xl font-medium tracking-[0.08em] text-content-primary"
            aria-label="TREVA"
        >
            TREVA
        </Link>
    );
}
