export type NewsCategory = "news" | "announcement";

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

export interface NewsInput {
    title: string;
    excerpt: string;
    body: string;
    category: NewsCategory;
    coverImageUrl?: string | null;
    pinned?: boolean;
}
