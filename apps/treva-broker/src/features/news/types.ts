export type NewsCategory = "news" | "announcement";

export type NewsStatus = "draft" | "scheduled" | "published";

export type AttachmentKind = "pdf" | "doc" | "sheet" | "image" | "other";

export interface NewsAttachment {
    id: string;
    name: string;
    sizeBytes: number;
    kind: AttachmentKind;
    /** Where the stored file is served from (`/uploads/...`); "" on fixtures. */
    url: string;
}

/** What the API answers after storing one file. */
export interface UploadedFile {
    url: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
}

/**
 * The switches in the editor's Visibility card (873:51626), minus "Pin this
 * Post", which is the post's own `pinned` flag — the feed's Pinned rail reads
 * that one.
 */
export const VISIBILITY_OPTIONS = [
    "featured",
    "showOnDashboard",
    "pushNotification",
    "emailNotification",
] as const;

export type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];

/** The languages an article can be written in — the editor's Language select. */
export type NewsLanguage = "az" | "en" | "ru";

export interface NewsPost {
    id: string;
    title: string;
    excerpt: string;
    body: string;
    category: NewsCategory;
    coverImageUrl: string | null;
    publishedAt: string;
    pinned: boolean;
    authorName: string;
    status: NewsStatus;
    attachments: NewsAttachment[];
    visibility: Record<VisibilityOption, boolean>;
    /** Empty until the author picks one. */
    language: NewsLanguage | "";
    /** ISO date-time the post goes live; empty while it is a draft. */
    publishAt: string;
    /** ISO date the post stops being shown; empty means it never expires. */
    expiresAt: string;
}

export interface NewsStats {
    postsThisWeek: number;
    unread: number;
    newToday: number;
}

export interface NewsListQuery {
    page?: number;
    perPage?: number;
    search?: string;
    category?: NewsCategory | "all";
}

/** Everything the editor collects. Every field is optional on update. */
export interface NewsInput {
    title: string;
    excerpt: string;
    body: string;
    category: NewsCategory;
    coverImageUrl?: string | null;
    pinned?: boolean;
    status?: NewsStatus;
    attachments?: NewsAttachment[];
    visibility?: Record<VisibilityOption, boolean>;
    language?: NewsLanguage | "";
    publishAt?: string;
    expiresAt?: string;
}

/** Sensible starting point for a new post. */
export const EMPTY_VISIBILITY: Record<VisibilityOption, boolean> = {
    featured: false,
    // The artboard starts with only this one on.
    showOnDashboard: true,
    pushNotification: false,
    emailNotification: false,
};
