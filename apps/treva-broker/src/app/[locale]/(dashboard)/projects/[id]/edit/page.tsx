import { notFound } from "next/navigation";

import { projectsService } from "@/features/projects/api/projects.service";
import { ProjectEditorView } from "@/features/projects/editor/project-editor-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

/**
 * The create screen (873:51091) over a loaded project — same layout, its own
 * breadcrumb, and the two extra actions a saved project can carry.
 */
export default async function ProjectEditPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "projects:update");

    try {
        const project = await projectsService.detail(id);
        return <ProjectEditorView project={project} mode="edit" />;
    } catch (error) {
        // A missing project is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
