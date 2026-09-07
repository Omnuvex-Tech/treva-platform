import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { projectsService } from "@/features/projects/api/projects.service";
import { ProjectDetailView } from "@/features/projects/components/project-detail-view";
import { isApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    try {
        const project = await projectsService.detail(id);
        return { title: project.name };
    } catch {
        // The page itself renders the 404; metadata just falls back.
        return {};
    }
}

/** A project's own screen (1173:16211). */
export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale: rawLocale, id } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "projects:read");

    try {
        const project = await projectsService.detail(id);
        return <ProjectDetailView project={project} />;
    } catch (error) {
        // A missing project is a 404, not a crash — anything else still throws.
        if (isApiError(error) && error.isNotFound) notFound();
        throw error;
    }
}
