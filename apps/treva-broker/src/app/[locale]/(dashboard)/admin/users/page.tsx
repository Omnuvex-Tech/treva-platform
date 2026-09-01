import type { Metadata } from "next";

import { UsersView } from "@/features/users/components/users-view";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const t = await getDictionary(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE);

    return { title: t.users.title };
}

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "admin:access", "users:read");

    return <UsersView />;
}
