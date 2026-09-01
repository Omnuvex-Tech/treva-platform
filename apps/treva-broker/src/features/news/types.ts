export type NewsCategory = "news" | "announcement";

export type NewsStatus = "draft" | "scheduled" | "published";

export type AttachmentKind = "pdf" | "doc" | "sheet" | "image" | "other";

export interface NewsAttachment {
    id: string;
    name: string;
    sizeBytes: number;
    kind: AttachmentKind;
}

/**
 * The audiences a post can be shown to. The editor's Visibility card is a list
 * of these with a toggle each (five rows in artboard 873:51626).
 */
export const VISIBILITY_AUDIENCES = [
    "brokers",
    "topBrokers",
    "admins",
    "agencies",
    "clients",
] as const;

export type VisibilityAudience = (typeof VISIBILITY_AUDIENCES)[number];

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
    visibility: Record<VisibilityAudience, boolean>;
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
    visibility?: Record<VisibilityAudience, boolean>;
    publishAt?: string;
    expiresAt?: string;
}

/** Sensible starting point for a new post. */
export const EMPTY_VISIBILITY: Record<VisibilityAudience, boolean> = {
    brokers: true,
    topBrokers: true,
    admins: true,
    agencies: false,
    clients: false,
};
