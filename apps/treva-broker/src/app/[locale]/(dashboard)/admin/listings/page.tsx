import { ComingSoon } from "@/components/common/coming-soon";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function AdminListingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "admin:access", "listings:read");

    return (
        <ComingSoon
            figmaNodes={{
                    admin: "886:15740",
            }}
        />
    );
}
