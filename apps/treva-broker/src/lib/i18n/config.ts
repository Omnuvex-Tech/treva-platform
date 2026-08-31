export const LOCALES = ["en", "az", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

/** The design ships English copy and the header switcher reads "EN". */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "treva_broker_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_LABELS: Record<Locale, { short: string; native: string; flag: string }> = {
    en: { short: "EN", native: "English", flag: "gb" },
    az: { short: "AZ", native: "Azərbaycan", flag: "az" },
    ru: { short: "RU", native: "Русский", flag: "ru" },
};

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}
