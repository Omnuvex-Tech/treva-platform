import type { Metadata } from "next";

import { ProfileView } from "@/features/users/components/profile-view";
import { requireSession } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const t = await getDictionary(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE);

    return { title: t.users.profile.title };
}

/**
 * Profile (873:48750).
 *
 * Session-gated only: every role has an account of its own, so this is the one
 * screen under /admin/users that is not behind `users:read`.
 */
export default async function AdminUserProfilePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requireSession(locale);

    return <ProfileView />;
}
