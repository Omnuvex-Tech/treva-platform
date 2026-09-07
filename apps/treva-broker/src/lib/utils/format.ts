import type { Locale } from "@/lib/i18n/config";

/**
 * BCP-47 tags for the three app locales. `az` and `ru` are valid on their own,
 * but pinning the region keeps date and currency output stable across the
 * Node and browser ICU builds, which do not always agree on the bare tag.
 */
const INTL_LOCALES: Record<Locale, string> = {
    // en-US, not en-GB: every date in the file is month-first
    // ("Apr 18, 2025", "July 7, 2026"), which is the US order.
    en: "en-US",
    az: "az-AZ",
    ru: "ru-RU",
};

/**
 * `Intl.*Format` construction is the expensive part — the formatting itself is
 * cheap. Tables re-format hundreds of cells per render, so instances are cached
 * per locale + options rather than rebuilt in the render loop.
 */
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

function dateFormatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${locale}:${JSON.stringify(options)}`;
    let formatter = dateFormatters.get(key);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], options);
        dateFormatters.set(key, formatter);
    }

    return formatter;
}

function numberFormatter(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${locale}:${JSON.stringify(options)}`;
    let formatter = numberFormatters.get(key);

    if (!formatter) {
        formatter = new Intl.NumberFormat(INTL_LOCALES[locale], options);
        numberFormatters.set(key, formatter);
    }

    return formatter;
}

/** "Apr 12, 2025" — the card and table date format used throughout the design. */
export function formatDate(value: string | Date, locale: Locale): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";

    return dateFormatter(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/**
 * "July 7, 2026" — the spelled-out month the agency row under the agent
 * editor uses (873:48887), where the tables elsewhere abbreviate it.
 */
export function formatLongDate(value: string | Date, locale: Locale): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";

    return dateFormatter(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | Date, locale: Locale): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";

    return dateFormatter(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
];

/**
 * "2 hr. ago" — the stamp on a project card (I873:49156;13186:150).
 *
 * The artboard writes it as "2h ago", which is English shorthand; `Intl` is
 * used instead so az and ru get their own forms rather than a hand-rolled
 * abbreviation that only reads as English.
 */
export function formatRelativeTime(value: string | Date, locale: Locale): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";

    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const formatter = new Intl.RelativeTimeFormat(INTL_LOCALES[locale], {
        numeric: "auto",
        style: "narrow",
    });

    for (const [unit, size] of RELATIVE_UNITS) {
        if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
    }

    return formatter.format(seconds, "second");
}

export function formatNumber(value: number, locale: Locale): string {
    return numberFormatter(locale, {}).format(value);
}

export function formatCurrency(value: number, locale: Locale, currency = "AZN"): string {
    return numberFormatter(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * "₼ 47,250" — the sign in front, then a space, then locale grouping.
 *
 * No `Intl` currency style produces this for any of the three locales: `en`
 * puts the narrow symbol tight against the digits and both `az` and `ru` put it
 * after the number. The artboards write it this way everywhere (1173:17975),
 * so the shape is fixed here and only the grouping stays locale-aware.
 */
export function formatManat(value: number, locale: Locale): string {
    return `₼ ${formatNumber(value, locale)}`;
}

/** "1.2M", "248K" — for stat tiles where the full number would not fit. */
export function formatCompact(value: number, locale: Locale): string {
    return numberFormatter(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, locale: Locale): string {
    return numberFormatter(locale, {
        style: "percent",
        maximumFractionDigits: 1,
    }).format(value / 100);
}

/** "AM" for "Aytac Mehdizade" — avatar fallback when there is no image. */
export function initials(fullName: string): string {
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

/**
 * Human file size. Uses binary units (1 KiB = 1024 B) but the conventional
 * "KB / MB" labels, which is what file managers and the design both show.
 */
export function formatBytes(bytes: number, locale: Locale): string {
    if (bytes < 1024) return `${bytes} B`;

    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    const formatted = new Intl.NumberFormat(INTL_LOCALES[locale], {
        maximumFractionDigits: value < 10 ? 1 : 0,
    }).format(value);

    return `${formatted} ${units[unitIndex]}`;
}
