import { notFound } from "next/navigation";

import { floorPlanService } from "@/features/floor-plan/api/floor-plan.service";
import { FloorPlanView } from "@/features/floor-plan/components/floor-plan-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function BuildingFloorPlanPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "floorplan:read");

    try {
        // Resolved here so an unknown building is a 404 before the client view
        // mounts and starts fetching it a second time.
        await floorPlanService.building(id);
        return <FloorPlanView buildingId={id} />;
    } catch (error) {
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
