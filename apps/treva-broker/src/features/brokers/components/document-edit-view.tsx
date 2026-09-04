"use client";

import { Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { formatBytes, formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteDocument, useUpdateDocument } from "../hooks/use-documents";
import {
    DOCUMENT_FLAGS,
    type BrokerDocument,
    type DocumentCategory,
    type DocumentFlag,
    type DocumentLanguage,
} from "../types";

const CATEGORIES: readonly DocumentCategory[] = [
    "brochure",
    "price_list",
    "floor_plan",
    "presentation",
    "policy",
    "other",
];

const LANGUAGES: readonly DocumentLanguage[] = ["az", "en", "ru"];

export interface DocumentEditViewProps {
    document: BrokerDocument;
}

/**
 * One row of the File Details card (873:52070).
 *
 * 12/Regular label against a 12/Semibold value, 12px in from each edge, with
 * the rule on the bottom of every row — the last one included, which is what
 * closes the card off above its own border.
 */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-2.5">
            <span className="truncate text-xs text-content-tertiary">{label}</span>
            <span className="truncate text-xs font-semibold text-content-primary">{children}</span>
        </div>
    );
}

/**
 * The card shell both columns use (876:13885 / 873:52066).
 *
 * One component because it is one component in the file: a bordered XXL card
 * whose header is separated by an Overlay/20 rule. Only the header differs —
 * the form card sets its title in 14/Bold ink beside a 14px glyph, the rail's
 * two cards in 14/Semibold on Content/Tertiary Inverse with no glyph.
 */
function Panel({
    title,
    icon,
    muted = false,
    children,
}: {
    title: string;
    icon?: ReactNode;
    /** The rail's grey-headed variant. */
    muted?: boolean;
    children?: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-md border border-border-subtle bg-bg-primary">
            <header
                className={cn(
                    "flex items-center gap-2 border-b border-[var(--color-border-overlay)] px-5",
                    muted ? "py-3" : "py-3.5",
                )}
            >
                {icon ? <span className="text-content-tertiary">{icon}</span> : null}
                <h2
                    className={cn(
                        "truncate text-sm",
                        muted
                            ? "font-semibold text-[var(--color-content-tertiary-inverse)]"
                            : "font-bold text-content-primary",
                    )}
                >
                    {title}
                </h2>
            </header>

            {children}
        </section>
    );
}

/**
 * The file editor (artboard 873:52019).
 *
 * Two panels side by side under the breadcrumb header, 12 apart and inset 16
 * with 20 of top padding: a 799 form column and a 317 rail. Both are white
 * cards on the app grey — the rail is not a bare column, and the form column is
 * not the page background, which is what makes the inner cards read as nested.
 *
 * The form column carries a 60px headline — the autosave chip left, three 44px
 * actions right — then a card holding a full-width field over two half-width
 * selects, and below it a bare comments field with no card around it.
 *
 * The rail holds a read-only File Details card and, 24 below it, the Visibility
 * card: four INDEPENDENT switches, not one audience chosen from a list. The
 * artboard has two of them on at once, which settles it.
 *
 * One thing the file does that this does not: it lists "Last Modified" twice
 * (873:52085 and 873:52095). The duplicate is dropped.
 */
export function DocumentEditView({ document }: DocumentEditViewProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();
    const router = useRouter();

    const updateDocument = useUpdateDocument();
    const deleteDocument = useDeleteDocument();
    const confirmDelete = useConfirmDelete();

    const [flags, setFlags] = useState<Record<DocumentFlag, boolean>>(document.flags);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const canManage = can("brokers:update");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);

        try {
            await updateDocument.mutateAsync({
                id: document.id,
                input: {
                    name: String(formData.get("name") ?? "").trim(),
                    category: String(formData.get("category") ?? "other") as DocumentCategory,
                    language: String(formData.get("language") ?? "en") as DocumentLanguage,
                    description: String(formData.get("description") ?? "").trim(),
                    flags,
                },
            });
            setSaved(true);
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    function performDelete() {
        deleteDocument.mutate(document.id, {
            // The file this screen is about is gone — go back to the library
            // rather than sit on a 404.
            onSuccess: () => router.push(routes.brokerRole(locale)),
            onSettled: confirmDelete.dismiss,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 px-4 pt-5 pb-8">
            {/* 876:13871 — the form column is itself a card: white, 3XL, padded
                16 with 12 between the headline and the form. */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg bg-bg-primary p-4">
                {/* 876:13872 — 60 tall, its 44px row inset 8. */}
                <div className="flex h-15 items-center justify-between gap-3 px-2">
                    <p className="flex items-center gap-3 truncate text-xs text-[var(--color-content-tertiary-inverse)]">
                        {saved ? t.brokerRole.editor.saved : t.brokerRole.editor.autosaved}
                        <span aria-hidden className="size-1.5 rounded-pill bg-content-positive" />
                    </p>

                    <div className="flex shrink-0 items-center gap-3">
                        {canManage ? (
                            <Button
                                type="button"
                                variant="dangerOutline"
                                size="lg"
                                className="rounded-lg px-3.5"
                                leadingIcon={
                                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                                }
                                onClick={confirmDelete.ask}
                            >
                                {t.brokerRole.editor.deleteFile}
                            </Button>
                        ) : null}

                        <Button
                            type="button"
                            variant="brandOutline"
                            size="lg"
                            className="rounded-lg px-3.5"
                            leadingIcon={
                                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
                            }
                            onClick={() => router.push(routes.brokerRole(locale))}
                        >
                            {t.common.cancel}
                        </Button>

                        {canManage ? (
                            <Button
                                type="submit"
                                size="lg"
                                className="rounded-lg border border-border-inverse px-3.5"
                                loading={updateDocument.isPending}
                            >
                                {t.brokerRole.editor.save}
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* 876:13883 — 751 wide, stopping 16 short of the headline, with
                    each card inset a further 8. */}
                <div className="flex w-[751px] max-w-full flex-col gap-3">
                    <div className="px-2">
                        <Panel
                            title={t.brokerRole.editor.fileInformation}
                            /* The same sheet the list rows draw — lucide's
                               file-text is what the artboard exports. */
                            icon={<FileText className="size-3.5" />}
                        >
                            <div className="flex flex-col gap-3 p-5">
                                <Input
                                    name="name"
                                    label={t.brokerRole.editor.fileName}
                                    surface="light"
                                    size="sm"
                                    defaultValue={document.name}
                                    required
                                    disabled={!canManage}
                                />

                                {/* 876:13898 — two 340.5 selects, 12 apart. */}
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Select
                                        name="category"
                                        label={t.brokerRole.editor.category}
                                        defaultValue={document.category}
                                        disabled={!canManage}
                                        options={CATEGORIES.map((value) => ({
                                            value,
                                            label: t.brokerRole.categories[value],
                                        }))}
                                        className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4"
                                    />
                                    <Select
                                        name="language"
                                        label={t.brokerRole.editor.language}
                                        defaultValue={document.language}
                                        disabled={!canManage}
                                        options={LANGUAGES.map((value) => ({
                                            value,
                                            label: t.brokerRole.languages[value],
                                        }))}
                                        className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4"
                                    />
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* 876:13901 holds nothing but the field — no header, no
                        card around it. */}
                    <div className="px-2">
                        <Textarea
                            name="description"
                            label={t.brokerRole.editor.description}
                            defaultValue={document.description}
                            disabled={!canManage}
                            className="h-[120px] rounded-lg border-border-tertiary bg-bg-primary p-3"
                        />
                    </div>

                    {error ? (
                        <p role="alert" className="px-2 text-sm text-content-negative">
                            {error}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* 873:52063 — 317 wide, a white card of its own, padded 20/24 with
                24 between its two cards. */}
            <aside className="hidden w-[317px] shrink-0 flex-col gap-6 rounded-lg bg-bg-primary px-5 py-6 lg:flex">
                <Panel title={t.brokerRole.details} muted>
                    <DetailRow label={t.brokerRole.currentVersion}>{document.version}</DetailRow>
                    <DetailRow label={t.brokerRole.uploadedBy}>{document.uploadedBy}</DetailRow>
                    <DetailRow label={t.brokerRole.uploadDate}>
                        {formatDate(document.uploadedAt, locale)}
                    </DetailRow>
                    <DetailRow label={t.brokerRole.lastModified}>
                        {formatDate(document.updatedAt, locale)}
                    </DetailRow>
                    <DetailRow label={t.brokerRole.fileSize}>
                        {formatBytes(document.sizeBytes, locale)}
                    </DetailRow>
                    <DetailRow label={t.brokerRole.fileType}>
                        {document.kind.toUpperCase()}
                    </DetailRow>
                </Panel>

                <Panel title={t.brokerRole.visibility} muted>
                    <div className="flex flex-col gap-2 px-5 py-4">
                        {DOCUMENT_FLAGS.map((flag) => (
                            <div key={flag} className="flex h-5 items-center justify-between gap-3">
                                <span className="truncate text-xs font-semibold text-content-primary">
                                    {t.brokerRole.flags[flag]}
                                </span>
                                <Switch
                                    checked={flags[flag]}
                                    disabled={!canManage}
                                    onChange={(event) =>
                                        setFlags((current) => ({
                                            ...current,
                                            [flag]: event.target.checked,
                                        }))
                                    }
                                    aria-label={t.brokerRole.flags[flag]}
                                />
                            </div>
                        ))}
                    </div>
                </Panel>
            </aside>

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.brokerRole.deleteConfirm}
                subject={document.name}
                confirmLabel={t.common.confirmDelete}
                loading={deleteDocument.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </form>
    );
}

/** There is only ever one thing to confirm here, so the target is a boolean. */
function useConfirmDelete() {
    const [isOpen, setOpen] = useState(false);
    return {
        isOpen,
        ask: () => setOpen(true),
        dismiss: () => setOpen(false),
    };
}
