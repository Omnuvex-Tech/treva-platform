import apiClient from "./client";

export type ArticleBlock =
    | { type: "heading"; level: 2 | 3; text: string }
    | { type: "paragraph"; text: string }
    | { type: "image"; url: string; alt: string; caption?: string }
    | { type: "list"; items: string[] }
    | { type: "faq"; question: string; answer: string }
    | { type: "quote"; text: string; author?: string }
    | { type: "video"; url: string }
    | { type: "gallery"; images: { url: string; alt: string }[] };

export interface ArticleAuthor {
    id: string;
    name: string;
    slug: string;
    title?: string;
    avatar?: string;
}

export interface ArticleKeyword {
    id: string;
    name: string;
    slug: string;
}

export interface Article {
    id: string;
    slug: string;
    title: string;
    category: string;
    date: string;
    coverImage?: string;
    excerpt?: string;
    authorId?: string;
    author?: ArticleAuthor;
    keywords?: ArticleKeyword[];
    blocks: ArticleBlock[];
    metaTitle?: string;
    metaDescription?: string;
    featured: boolean;
    published: boolean;
    headerPosition?: "left" | "center" | "right" | "week" | null;
    headerOrder?: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleData {
    slug: string;
    title: string;
    category: string;
    date?: string;
    coverImage?: string;
    excerpt?: string;
    authorId?: string;
    keywordIds?: string[];
    blocks?: ArticleBlock[];
    metaTitle?: string;
    metaDescription?: string;
    featured?: boolean;
    published?: boolean;
    headerPosition?: "left" | "center" | "right" | "week" | null;
    headerOrder?: number | null;
}

export interface PaginatedArticles {
    data: Article[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const articlesApi = {
    getAll: (params?: { page?: number; limit?: number; category?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.category) searchParams.set("category", params.category);
        return apiClient.get<PaginatedArticles>(
            `/pulse/articles?${searchParams.toString()}`,
        );
    },

    getAllAdmin: () => apiClient.get<Article[]>("/pulse/articles/all"),

    getHeaderArticles: (position: "left" | "center" | "right") =>
        apiClient.get<Article[]>(`/pulse/articles/header?position=${position}`),

    getById: (id: string) => apiClient.get<Article>(`/pulse/articles/${id}`),

    getBySlug: (slug: string) =>
        apiClient.get<Article>(`/pulse/articles/slug/${slug}`),

    create: (data: CreateArticleData) =>
        apiClient.post<Article>("/pulse/articles", data),

    update: (id: string, data: CreateArticleData) =>
        apiClient.patch<Article>(`/pulse/articles/${id}`, data),

    delete: (id: string) => apiClient.delete(`/pulse/articles/${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<{ url: string }>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
