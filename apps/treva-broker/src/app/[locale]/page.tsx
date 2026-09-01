import { redirect } from "next/navigation";

import { HOME_ROUTE } from "@/config/routes";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

/**
 * `/en` has no screen of its own — News Feed is the first sidebar item for
 * every role, so it is the landing page.
 */
export default async function LocaleRootPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    redirect(HOME_ROUTE(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE));
}
