import { ComingSoon } from "@/components/common/coming-soon";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function FloorPlanPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "floorplan:read");

    return (
        <ComingSoon
            figmaNodes={{
                    admin: "873:48904",
                    topBroker: "873:58620",
                    broker: "873:71395",
            }}
        />
    );
}
