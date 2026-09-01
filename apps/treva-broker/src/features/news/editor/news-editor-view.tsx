"use client";

import { ArrowLeft01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { useCreateNews, useUpdateNews } from "../hooks/use-news";
import { useAutosave } from "../hooks/use-autosave";
import { EMPTY_VISIBILITY, type NewsInput, type NewsPost } from "../types";
import { AttachmentsCard } from "./attachments-card";
import { BasicInformationCard } from "./basic-information-card";
import { CoverImageCard } from "./cover-image-card";
import { NewsContentCard } from "./news-content-card";
import { PublishingCard } from "./publishing-card";
import { VisibilityCard } from "./visibility-card";

export interface NewsEditorViewProps {
    /** `null` composes a new article; otherwise the editor edits this one. */
    post: NewsPost | null;
}

/** Everything the editor holds, in one object so autosave can watch it. */
interface EditorState {
    title: string;
    excerpt: string;
    body: string;
    category: NewsPost["category"];
    coverImageUrl: string | null;
    attachments: NewsPost["attachments"];
    visibility: NewsPost["visibility"];
    publishDate: string;
    publishTime: string;
    expiryDate: string;
    expiryPolicy: string;
    authorName: string;
}

function initialState(post: NewsPost | null): EditorState {
    const publishAt = post?.publishAt ?? "";

    return {
        title: post?.title ?? "",
        excerpt: post?.excerpt ?? "",
        body: post?.body ?? "",
        category: post?.category ?? "news",
        coverImageUrl: post?.coverImageUrl ?? null,
        attachments: post?.attachments ?? [],
        visibility: post?.visibility ?? EMPTY_VISIBILITY,
        // An ISO timestamp splits cleanly into the date and time inputs.
        publishDate: publishAt.slice(0, 10),
        publishTime: publishAt.slice(11, 16),
        expiryDate: post?.expiresAt?.slice(0, 10) ?? "",
        expiryPolicy: "keep",
        authorName: post?.authorName ?? "",
    };
}

function toInput(state: EditorState, status: NewsPost["status"]): NewsInput {
    return {
        title: state.title.trim(),
        excerpt: state.excerpt.trim(),
        body: state.body,
        category: state.category,
        coverImageUrl: state.coverImageUrl,
        attachments: state.attachments,
        visibility: state.visibility,
        status,
        publishAt:
            state.publishDate && state.publishTime
                ? `${state.publishDate}T${state.publishTime}:00.000Z`
                : state.publishDate
                  ? `${state.publishDate}T09:00:00.000Z`
                  : "",
        expiresAt: state.expiryDate ? `${state.expiryDate}T23:59:59.000Z` : "",
    };
}

/**
 * The news editor (artboards 873:51432 / 873:51755).
 *
 * Two columns: the composition cards on the left, publishing and visibility in
 * a 317px rail on the right. State lives here as one object so `useAutosave`
 * can watch the whole draft; each card is a controlled presentational piece
 * that reports a patch upward.
 */
export function NewsEditorView({ post }: NewsEditorViewProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const toast = useToast();

    const [state, setState] = useState<EditorState>(() => initialState(post));
    const [error, setError] = useState<string | null>(null);
    const [draftId, setDraftId] = useState<string | null>(post?.id ?? null);

    const createNews = useCreateNews();
    const updateNews = useUpdateNews();

    const patch = useCallback((next: Partial<EditorState>) => {
        setState((current) => ({ ...current, ...next }));
    }, []);

    // Autosave only once the article has a title — saving an untouched empty
    // form would litter the feed with blank drafts.
    const canAutosave = state.title.trim().length > 0;

    const saveDraft = useCallback(
        async (value: EditorState) => {
            const input = toInput(value, "draft");

            if (draftId) {
                await updateNews.mutateAsync({ id: draftId, input });
                return;
            }

            const created = await createNews.mutateAsync(input);
            setDraftId(created.id);
        },
        [createNews, draftId, updateNews],
    );

    const { state: autosave } = useAutosave({
        value: state,
        save: saveDraft,
        enabled: canAutosave,
    });

    const busy = createNews.isPending || updateNews.isPending;
    const editing = post !== null;

    async function publish() {
        setError(null);

        if (!state.title.trim()) {
            setError(t.news.editor.titlePlaceholder);
            return;
        }

        try {
            const input = toInput(state, "published");

            if (draftId) {
                await updateNews.mutateAsync({ id: draftId, input });
            } else {
                await createNews.mutateAsync(input);
            }

            toast.success(t.news.editor.publishedToast);
            router.push(routes.newsFeed(locale));
        } catch (publishError) {
            setError(isApiError(publishError) ? publishError.message : t.common.error);
        }
    }

    const headerStatus = useMemo(() => {
        if (autosave === "saving") return t.news.editor.saving;
        if (autosave === "saved") return t.news.editor.autosavedDraft;
        return null;
    }, [autosave, t]);

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        href={routes.newsFeed(locale)}
                        className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.6} />
                        {t.news.editor.backToFeed}
                    </Link>

                    {headerStatus ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-content-tertiary">
                            <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                size={14}
                                strokeWidth={1.8}
                                className={autosave === "saved" ? "text-content-positive" : undefined}
                            />
                            {headerStatus}
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => void saveDraft(state)}
                        loading={busy && autosave === "saving"}
                    >
                        {t.news.editor.saveDraft}
                    </Button>

                    <Button onClick={publish} loading={busy}>
                        {editing ? t.news.editor.update : t.news.editor.publish}
                    </Button>
                </div>
            </div>

            {error ? (
                <p role="alert" className="text-sm text-content-negative">
                    {error}
                </p>
            ) : null}

            {/* 799 + 16 gap + 345 = the 1160 body width. The create artboard
                (873:51432) draws the rail at 317, the edit one (873:51755) at 345;
                345 is the one that adds up, so it wins. */}
            <div className="grid gap-4 xl:grid-cols-[1fr_345px]">
                <div className="flex min-w-0 flex-col gap-4">
                    <BasicInformationCard
                        title={state.title}
                        excerpt={state.excerpt}
                        category={state.category}
                        onChange={patch}
                    />

                    <CoverImageCard
                        coverImageUrl={state.coverImageUrl}
                        onChange={(coverImageUrl) => patch({ coverImageUrl })}
                    />

                    <NewsContentCard
                        body={state.body}
                        onChange={(body) => patch({ body })}
                        autosave={autosave}
                    />

                    <AttachmentsCard
                        attachments={state.attachments}
                        onChange={(attachments) => patch({ attachments })}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <PublishingCard
                        publishDate={state.publishDate}
                        publishTime={state.publishTime}
                        expiryDate={state.expiryDate}
                        expiryPolicy={state.expiryPolicy}
                        authorName={state.authorName}
                        onChange={patch}
                    />

                    <VisibilityCard
                        visibility={state.visibility}
                        onChange={(visibility) => patch({ visibility })}
                    />
                </div>
            </div>
        </div>
    );
}
