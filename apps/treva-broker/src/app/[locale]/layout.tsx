import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { appConfig } from "@/config/app";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";

import "../globals.css";

/**
 * This is the app's ROOT layout — there is deliberately no `app/layout.tsx`.
 *
 * `<html lang>` has to reflect the active locale, and only a segment that
 * receives `params.locale` can know it. The middleware guarantees every page
 * URL is locale-prefixed, so no request ever reaches a route outside this
 * segment.
 */
export const metadata: Metadata = {
    title: {
        default: appConfig.name,
        template: `%s · ${appConfig.name}`,
    },
    description: appConfig.description,
    // An internal CRM has nothing to gain from being indexed.
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
};

/** Pre-renders all three locale shells at build time instead of on first hit. */
export function generateStaticParams() {
    return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    const dictionary = await getDictionary(locale);

    return (
        <html lang={locale}>
            <head>
                {/* Oak Sans is the display face in the Figma variable set. Loaded
                    with a <link> rather than an @import in globals.css: Tailwind's
                    import resolver strips remote @import rules, so the font would
                    never reach the bundle. Same approach as treva-web. */}
                <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="" />
                <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/oak-sans" />
            </head>
            <body>
                <QueryProvider>
                    <I18nProvider locale={locale} dictionary={dictionary}>
                        {children}
                    </I18nProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
