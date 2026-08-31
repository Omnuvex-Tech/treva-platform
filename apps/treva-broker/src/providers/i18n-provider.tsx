"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { interpolate } from "@/lib/i18n/interpolate";

interface I18nContextValue {
    locale: Locale;
    t: Dictionary;
    /** `format(t.common.showing, { from: 1, to: 10, total: 42 })` */
    format: (template: string, values: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Hands the already-loaded dictionary to Client Components.
 *
 * Server Components read their copy straight from `getDictionary(locale)`; this
 * provider exists only so a client component deep in the tree does not have to
 * take a `t` prop through five layers. The dictionary crosses the boundary once,
 * as part of the layout payload.
 */
export function I18nProvider({
    locale,
    dictionary,
    children,
}: {
    locale: Locale;
    dictionary: Dictionary;
    children: ReactNode;
}) {
    const value = useMemo<I18nContextValue>(
        () => ({ locale, t: dictionary, format: interpolate }),
        [locale, dictionary],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error("useI18n must be used inside an I18nProvider ([locale] layout).");
    }

    return context;
}

/** Shorthand for `const { t } = useI18n()`. */
export function useTranslations(): Dictionary {
    return useI18n().t;
}

/** Shorthand for `const { locale } = useI18n()`. */
export function useLocale(): Locale {
    return useI18n().locale;
}
