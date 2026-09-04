import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { usersService } from "@/features/users/api/users.service";
import { UserFormView } from "@/features/users/components/user-form-view";
import { isApiError } from "@/lib/api/errors";
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

    return { title: t.users.form.editTitle };
}

/** Agent edit (873:48814). */
export default async function AdminUserEditPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "admin:access", "users:update");

    try {
        const user = await usersService.detail(id);
        return <UserFormView user={user} />;
    } catch (error) {
        // A missing account is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
