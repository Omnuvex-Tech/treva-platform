/* eslint-disable @next/next/no-img-element -- a fixed 100x40 crop of the exported artwork; next/image adds nothing here */
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { HOME_ROUTE } from "@/config/routes";

/**
 * TREVA wordmark — the 100x40 `Container` in the logo cell (873:49163).
 *
 * The file places a larger raster inside that frame and crops it, so the same
 * offsets are reproduced here rather than re-exporting a tighter image: the
 * wordmark lands on exactly the pixels the artboard puts it on.
 */
export function Logo({ locale }: { locale: Locale }) {
    return (
        <Link
            href={HOME_ROUTE(locale)}
            aria-label="TREVA"
            className="relative block h-10 w-[100px] shrink-0 overflow-hidden rounded-sm"
        >
            <img
                src="/images/layout/logo.png"
                alt=""
                className="absolute top-[-55.13%] left-[-12.96%] h-[210.26%] w-[125.93%] max-w-none"
            />
        </Link>
    );
}
