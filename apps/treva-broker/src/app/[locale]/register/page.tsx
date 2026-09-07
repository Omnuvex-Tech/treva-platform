import type { Metadata } from "next";

import { RegisterView } from "@/features/auth/components/register-view";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const t = await getDictionary(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE);

    return { title: t.auth.registerType.title };
}

/**
 * Sign-up (873:60083 and its four sibling states).
 *
 * Deliberately NOT under the (auth) group: those screens are a 50/50 split with
 * the dark brand panel, and this one is a single card centred on the full width.
 */
export default function RegisterPage() {
    return <RegisterView />;
}
