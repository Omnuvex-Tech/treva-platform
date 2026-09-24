"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { isApiError } from "@/lib/api/errors";
import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { useCreateNews, useUpdateNews } from "../hooks/use-news";
import { useAutosave } from "../hooks/use-autosave";
import { EMPTY_VISIBILITY, type NewsCategory, type NewsInput, type NewsPost } from "../types";
import { AttachmentsCard } from "./attachments-card";
import { BasicInformationCard } from "./basic-information-card";
import { CoverImageCard } from "./cover-image-card";
import { outlineButtonClass } from "./editor-card";
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
    /** Empty until picked — the artboard's select starts blank. */
    category: NewsCategory | "";
    coverImageUrl: string | null;
    attachments: NewsPost["attachments"];
    pinned: boolean;
    visibility: NewsPost["visibility"];
    language: NewsPost["language"];
    publishDate: string;
    publishTime: string;
    expiryDate: string;
}

function initialState(post: NewsPost | null): EditorState {
    const publishAt = post?.publishAt ?? "";

    return {
        title: post?.title ?? "",
        excerpt: post?.excerpt ?? "",
        body: post?.body ?? "",
        category: post?.category ?? "",
        coverImageUrl: post?.coverImageUrl ?? null,
        attachments: post?.attachments ?? [],
        pinned: post?.pinned ?? false,
        visibility: post?.visibility ?? EMPTY_VISIBILITY,
        language: post?.language ?? "",
        // An ISO timestamp splits cleanly into the date and time inputs.
        publishDate: publishAt.slice(0, 10),
        publishTime: publishAt.slice(11, 16),
        expiryDate: post?.expiresAt?.slice(0, 10) ?? "",
    };
}

function toInput(state: EditorState, status: NewsPost["status"]): NewsInput {
    return {
        title: state.title.trim(),
        excerpt: state.excerpt.trim(),
        body: state.body,
        // A draft may be saved before a category is chosen.
        category: state.category || "news",
        coverImageUrl: state.coverImageUrl,
        attachments: state.attachments,
        pinned: state.pinned,
        visibility: state.visibility,
        language: state.language,
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
 * The news editor (artboard 873:51432).
 *
 * On Background/Secondary, 16px in: a 799px white column — the header row and
 * the four cards, 12px apart inside 16px of padding, each card inset another
 * 8px — and 12px to its right a white rail with Publishing and Visibility,
 * 24px apart inside 20 / 24 padding. The page scrolls as a whole, as the
 * 1656px-tall artboard does.
 *
 * State lives here as one object so `useAutosave` can watch the whole draft;
 * each card is a controlled presentational piece that reports a patch upward.
 */
export function NewsEditorView({ post }: NewsEditorViewProps) {
    const { locale, t } = useI18n();
    const copy = t.news.editor;
    const router = useRouter();
    const toast = useToast();

    const [state, setState] = useState<EditorState>(() => initialState(post));
    const [error, setError] = useState<string | null>(null);

    const createNews = useCreateNews();
    const updateNews = useUpdateNews();
    const { mutateAsync: createPost } = createNews;
    const { mutateAsync: updatePost } = updateNews;

    /**
     * Every save — autosave, Save draft, Publish — runs after the one before it
     * settles. Otherwise an autosave still pending when the first create lands
     * makes a second draft, and a late autosave can turn a just-published post
     * back into a draft. The id lives in a ref for the same reason: the queued
     * save must see the id the previous one produced, not a stale render's.
     */
    const postId = useRef<string | null>(post?.id ?? null);
    const queue = useRef<Promise<unknown>>(Promise.resolve());

    const persist = useCallback(
        (input: NewsInput) => {
            const run = async () => {
                if (postId.current) {
                    await updatePost({ id: postId.current, input });
                    return;
                }

                postId.current = (await createPost(input)).id;
            };

            const next = queue.current.then(run, run);
            queue.current = next.catch(() => undefined);
            return next;
        },
        [createPost, updatePost],
    );

    const patch = useCallback((next: Partial<EditorState>) => {
        setState((current) => ({ ...current, ...next }));
    }, []);

    // Autosave only once the article has a title — saving an untouched empty
    // form would litter the feed with blank drafts — and only while it is a
    // draft: autosaving a live post would take it off the feed mid-edit.
    const canAutosave = state.title.trim().length > 0 && (post === null || post.status === "draft");

    const saveDraft = useCallback((value: EditorState) => persist(toInput(value, "draft")), [persist]);

    const { state: autosave } = useAutosave({
        value: state,
        save: saveDraft,
        enabled: canAutosave,
    });

    const busy = createNews.isPending || updateNews.isPending;
    const editing = post !== null;

    async function saveNow() {
        setError(null);
        try {
            await saveDraft(state);
            toast.success(copy.draftToast);
        } catch (saveError) {
            setError(isApiError(saveError) ? saveError.message : t.common.error);
        }
    }

    async function publish() {
        setError(null);

        const missing = !state.title.trim()
            ? copy.titleLabel
            : !state.excerpt.trim()
              ? copy.summaryLabel
              : !state.category
                ? copy.categoryLabel
                : null;

        if (missing) {
            setError(`${missing}*`);
            return;
        }

        try {
            await persist(toInput(state, "published"));

            toast.success(copy.publishedToast);
            router.push(routes.newsFeed(locale));
        } catch (publishError) {
            setError(isApiError(publishError) ? publishError.message : t.common.error);
        }
    }

    return (
        // Its own scroll area, without a drawn bar: the artboard has none, and
        // the layout's gutter would take 11px from the 317px rail.
        <div className="scrollbar-none h-full overflow-y-auto bg-bg-secondary">
            <div className="flex min-h-full items-stretch gap-3 px-4">
                <div className="flex min-w-0 flex-[0_1_799px] flex-col gap-3 bg-bg-primary p-4">
                    {/* `headline` (873:51447): 8px padding, the autosave note on the
                    left, the three 44px actions 12px apart on the right. */}
                    <div className="flex items-center justify-between gap-3 p-2">
                        <span className="flex items-center gap-3 text-xs leading-[18px] text-[var(--color-content-tertiary-inverse)]">
                            {autosave === "saving" ? copy.saving : copy.autosavedDraft}
                            <span
                                aria-hidden
                                className={cn(
                                    "size-1.5 rounded-pill",
                                    autosave === "saving" ? "bg-content-notice" : "bg-content-positive",
                                )}
                            />
                        </span>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => void saveNow()}
                                disabled={busy}
                                className={cn(outlineButtonClass, "h-11 px-[13px]")}
                            >
                                <AssetIcon src="/images/news/editor/save-draft.svg" size={16} />
                                {copy.saveDraft}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push(routes.newsFeed(locale))}
                                className={cn(outlineButtonClass, "h-11 px-[13px]")}
                            >
                                <AssetIcon src="/images/news/editor/cancel.svg" size={16} />
                                {t.common.cancel}
                            </button>

                            <button
                                type="button"
                                onClick={() => void publish()}
                                disabled={busy}
                                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border-inverse bg-bg-brand px-[13px] text-sm leading-5 font-medium whitespace-nowrap text-content-inverse transition-colors hover:bg-content-brand-bold disabled:opacity-60"
                            >
                                <AssetIcon src="/images/news/editor/publish.svg" size={16} />
                                {editing ? copy.update : copy.publish}
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <p role="alert" className="px-2 text-sm text-content-negative">
                            {error}
                        </p>
                    ) : null}

                    <div className="px-2">
                        <BasicInformationCard
                            title={state.title}
                            excerpt={state.excerpt}
                            category={state.category}
                            onChange={patch}
                        />
                    </div>

                    <div className="px-2">
                        <CoverImageCard
                            coverImageUrl={state.coverImageUrl}
                            onChange={(coverImageUrl) => patch({ coverImageUrl })}
                        />
                    </div>

                    <div className="px-2">
                        <NewsContentCard
                            body={state.body}
                            onChange={(body) => patch({ body })}
                            autosave={autosave}
                        />
                    </div>

                    <div className="px-2">
                        <AttachmentsCard
                            attachments={state.attachments}
                            onChange={(attachments) => patch({ attachments })}
                        />
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-6 bg-bg-primary px-5 py-6">
                    <PublishingCard
                        publishDate={state.publishDate}
                        publishTime={state.publishTime}
                        language={state.language}
                        expiryDate={state.expiryDate}
                        onChange={patch}
                    />

                    <VisibilityCard pinned={state.pinned} visibility={state.visibility} onChange={patch} />
                </div>
            </div>
        </div>
    );
}
