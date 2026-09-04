"use client";

import { Delete02Icon, Link01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useConfirm } from "@/hooks/use-confirm";
import { isApiError } from "@/lib/api/errors";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteProject, useSaveProject } from "../hooks/use-projects";
import type {
    Project,
    ProjectAvailability,
    ProjectHighlight,
    ProjectMaterial,
    ProjectOffer,
} from "../types";
import { AvailabilitySection } from "./availability-section";
import { GallerySection } from "./gallery-section";
import { HighlightsSection } from "./highlights-section";
import { MaterialsSection } from "./materials-section";
import { OffersSection } from "./offers-section";

export interface ProjectEditorViewProps {
    project: Project;
    /**
     * `create` is 873:51091 as drawn — a blank draft whose action reads "Save
     * Changes" and whose crumb is "Add new projects". `edit` is the same screen
     * over a loaded project: identical layout, its own crumb, and the two extra
     * actions a saved project can carry (view, delete).
     */
    mode?: "create" | "edit";
}

/**
 * The project editor (artboard 873:51091).
 *
 * One long column, not a two-pane form: a 60px headline carrying the project
 * name, its public URL and the actions, then five sections — gallery, Key
 * Highlights, Special Offers, Marketing Materials and Live Availability.
 *
 * The two gaps are different and both come off the artboard: 12 between the
 * headline and the first section (873:51105 ends at 76, 873:51111 starts at
 * 88), then 40 between the sections themselves. Everything is inset 16 from the
 * content area with a further 8 inside each section, which is what lines the
 * cards up with the headline.
 *
 * The artboard is 2408 tall and scrolls; nothing here is sticky, including the
 * save row, because the file draws none.
 */
export function ProjectEditorView({ project, mode = "edit" }: ProjectEditorViewProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();
    const router = useRouter();

    const editing = mode === "edit";
    const saveProject = useSaveProject();
    const deleteProject = useDeleteProject();
    const confirmDelete = useConfirm<Project>();

    const [name, setName] = useState(project.name);
    const [publicUrl, setPublicUrl] = useState(project.publicUrl);
    const [heroImageUrl, setHeroImageUrl] = useState(project.heroImageUrl);
    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([
        ...project.galleryImageUrls,
    ]);
    const [highlights, setHighlights] = useState<ProjectHighlight[]>([...project.highlights]);
    const [offers, setOffers] = useState<ProjectOffer[]>([...project.offers]);
    const [materials, setMaterials] = useState<ProjectMaterial[]>([...project.materials]);
    const [availability, setAvailability] = useState<ProjectAvailability>(project.availability);
    const [error, setError] = useState<string | null>(null);

    const canManage = can(editing ? "projects:update" : "projects:create");

    function performDelete() {
        deleteProject.mutate(project.id, {
            onSettled: confirmDelete.dismiss,
            onSuccess: () => router.push(routes.projects(locale)),
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await saveProject.mutateAsync({
                id: project.id,
                input: {
                    name: name.trim(),
                    publicUrl: publicUrl.trim(),
                    heroImageUrl,
                    galleryImageUrls,
                    highlights,
                    offers,
                    availability,
                },
            });
            router.push(routes.projects(locale));
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    function addMaterials(files: File[]) {
        // No multipart path exists yet, so a picked file becomes a row from its
        // own metadata; the bytes are dropped until the upload endpoint lands.
        setMaterials((current) => [
            ...current,
            ...files.map((file, index) => ({
                id: `mt_${Date.now().toString(36)}_${index}`,
                name: file.name,
                category: "other",
                language: "en",
                sizeBytes: file.size,
                downloads: 0,
            })),
        ]);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col px-4 pt-4 pb-8">
            {/* 873:51105 — 60 tall, its row inset 8: the name left, the URL and
                the two actions right, 12 apart. */}
            <div className="mb-3 flex h-15 items-center justify-between gap-3 px-2">
                <input
                    value={name}
                    disabled={!canManage}
                    onChange={(event) => setName(event.target.value)}
                    aria-label={t.projects.editor.name}
                    placeholder={t.projects.editor.name}
                    className="min-w-0 flex-1 bg-transparent text-base font-medium text-content-primary outline-none placeholder:text-content-disabled"
                />

                <div className="flex shrink-0 items-center gap-3">
                    <Input
                        type="url"
                        value={publicUrl}
                        disabled={!canManage}
                        onChange={(event) => setPublicUrl(event.target.value)}
                        aria-label={t.projects.editor.publicUrl}
                        placeholder={t.projects.editor.publicUrl}
                        surface="light"
                        size="sm"
                        leadingIcon={
                            <HugeiconsIcon icon={Link01Icon} size={16} strokeWidth={1.6} />
                        }
                        containerClassName="w-[412px]"
                    />

                    {/* Create draws exactly two actions (873:51109/51110).
                        Edit is that row plus the two a saved project can carry:
                        a way to its read screen and a way to remove it. */}
                    {editing ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="rounded-lg px-3.5"
                                onClick={() =>
                                    router.push(routes.projectDetail(locale, project.id))
                                }
                                leadingIcon={
                                    <HugeiconsIcon
                                        icon={ViewIcon}
                                        size={16}
                                        strokeWidth={1.6}
                                    />
                                }
                            >
                                {t.common.detail}
                            </Button>

                            {can("projects:delete") ? (
                                <Button
                                    type="button"
                                    variant="dangerOutline"
                                    size="lg"
                                    className="rounded-lg px-3.5"
                                    onClick={() => confirmDelete.ask(project)}
                                    leadingIcon={
                                        <HugeiconsIcon
                                            icon={Delete02Icon}
                                            size={16}
                                            strokeWidth={1.6}
                                        />
                                    }
                                >
                                    {t.common.delete}
                                </Button>
                            ) : null}
                        </>
                    ) : null}

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="rounded-lg px-3.5"
                        onClick={() => router.push(routes.projects(locale))}
                    >
                        {t.common.cancel}
                    </Button>

                    {canManage ? (
                        <Button
                            type="submit"
                            size="lg"
                            className="rounded-lg border border-border-inverse px-3.5"
                            loading={saveProject.isPending}
                        >
                            {t.projects.editor.save}
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-col gap-10">
                <GallerySection
                    heroImageUrl={heroImageUrl}
                    galleryImageUrls={galleryImageUrls}
                    disabled={!canManage}
                    onChange={(next) => {
                        setHeroImageUrl(next.heroImageUrl);
                        setGalleryImageUrls(next.galleryImageUrls);
                    }}
                />

                <HighlightsSection
                    highlights={highlights}
                    onChange={setHighlights}
                    disabled={!canManage}
                />

                <OffersSection offers={offers} onChange={setOffers} disabled={!canManage} />

                <MaterialsSection
                    materials={materials}
                    disabled={!canManage}
                    onAdd={addMaterials}
                    onDelete={(material) =>
                        setMaterials((current) => current.filter((e) => e.id !== material.id))
                    }
                />

                <AvailabilitySection
                    availability={availability}
                    onChange={setAvailability}
                    disabled={!canManage}
                />
            </div>

            {error ? (
                <p role="alert" className="px-2 text-sm text-content-negative">
                    {error}
                </p>
            ) : null}

            {/* Only the edit screen can reach this — a draft that was never
                saved has nothing to remove. */}
            {editing ? (
                <ConfirmDialog
                    open={confirmDelete.isOpen}
                    title={t.common.deleteTitle}
                    description={t.projects.deleteConfirm}
                    subject={confirmDelete.target?.name}
                    confirmLabel={t.common.confirmDelete}
                    loading={deleteProject.isPending}
                    onConfirm={performDelete}
                    onCancel={confirmDelete.dismiss}
                />
            ) : null}
        </form>
    );
}
