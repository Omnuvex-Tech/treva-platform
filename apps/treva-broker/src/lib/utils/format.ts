import type { Locale } from "@/lib/i18n/config";

/**
 * BCP-47 tags for the three app locales. `az` and `ru` are valid on their own,
 * but pinning the region keeps date and currency output stable across the
 * Node and browser ICU builds, which do not always agree on the bare tag.
 */
const INTL_LOCALES: Record<Locale, string> = {
    en: "en-GB",
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
