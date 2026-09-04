import type { Metadata } from "next";

import { emptyProject } from "@/features/projects/empty-project";
import { ProjectEditorView } from "@/features/projects/editor/project-editor-view";
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

    return { title: t.projects.editor.createTitle };
}

/** "Add new projects" — the editor over a blank draft (873:51091). */
export default async function ProjectNewPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    await requirePermission(locale, "projects:create");

    return <ProjectEditorView project={emptyProject()} mode="create" />;
}
