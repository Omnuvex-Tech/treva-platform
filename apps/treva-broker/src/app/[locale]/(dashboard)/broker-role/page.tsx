import { ComingSoon } from "@/components/common/coming-soon";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function BrokerRolePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "brokers:read");

    return (
        <ComingSoon
            figmaNodes={{
                    admin: "873:49451",
                    topBroker: "873:59654",
                    broker: "873:72424",
            }}
        />
    );
}
