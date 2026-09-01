export const LOCALES = ["en", "az", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

/** The design ships English copy and the header switcher reads "EN". */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "treva_broker_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * `short` is the chip in the app header; `label` is the row in the dropdown,
 * spelled the way the design writes it (873:51422 lists "Azerbaijan",
 * "Russian", "English"). `native` is kept for anywhere the endonym reads better.
 */
export const LOCALE_LABELS: Record<Locale, { short: string; label: string; native: string }> = {
    en: { short: "EN", label: "English", native: "English" },
    az: { short: "AZ", label: "Azerbaijan", native: "Azərbaycan" },
    ru: { short: "RU", label: "Russian", native: "Русский" },
};

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}
