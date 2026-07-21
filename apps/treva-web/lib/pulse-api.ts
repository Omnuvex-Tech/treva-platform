import { Article } from "./pulse.types";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10021";

export type ArticleBlock =
    | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
    | { type: "paragraph"; text: string }
    | { type: "image"; url: string; alt: string; caption?: string }
    | { type: "list"; items: string[]; ordered?: boolean }
    | { type: "faq"; question: string; answer: string }
    | { type: "quote"; text: string; author?: string }
    | { type: "video"; url: string }
    | { type: "gallery"; images: { url: string; alt: string }[] };

export type LocalizedString = string | { az?: string; en?: string; ru?: string };

export function getLocalized(value: any, locale: string = "az"): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
        // Ensure we handle objects safely
        const val = value[locale as keyof typeof value] || value.az;
        if (typeof val === "string") return val;
        const firstValue = Object.values(value).find(v => typeof v === "string");
        if (firstValue) return firstValue as string;
    }
    return "";
}

interface ApiAuthorPayload {
    id: string;
    name: LocalizedString;
    slug: string;
    title?: LocalizedString;
    linkedin?: string;
    avatar?: string;
    description?: LocalizedString;
}

export interface ApiAuthor {
    id: string;
    name: string;
    slug: string;
    title?: string;
    linkedin?: string;
    avatar?: string;
    description?: string;
}

export interface ApiKeyword {
    id: string;
    name: LocalizedString;
    slug: string;
}

export interface ApiArticle {
    id: string;
    slug: string;
    title: LocalizedString;
    category: LocalizedString;
    date: string;
    coverImage?: string;
    excerpt?: LocalizedString;
    authorId?: string;
    author?: ApiAuthorPayload;
    keywords?: ApiKeyword[];
    blocks: ArticleBlock[];
    metaTitle?: LocalizedString;
    metaDescription?: LocalizedString;
    featured: boolean;
    published: boolean;
    headerPositions?: string[];
    headerOrder?: number | null;
    selectedArticles?: ApiArticle[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

async function parseJsonResponse<T>(res: Response): Promise<T | null> {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
}

export async function getArticles(params?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<ApiArticle>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const url = `${API}/pulse/articles${searchParams.toString() ? `?${searchParams}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch articles");
    const data = await parseJsonResponse<any>(res);
    if (!data) {
        return { data: [], pagination: { page: 1, limit: params?.limit ?? 0, total: 0, totalPages: 0 } };
    }
    // Handle cms-api { value, Count } format
    if (data && Array.isArray(data.value)) {
        return { data: data.value, pagination: { page: 1, limit: data.Count ?? data.value.length, total: data.Count ?? data.value.length, totalPages: 1 } };
    }
    // Handle both paginated and plain array responses
    if (Array.isArray(data)) {
        return { data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
    }
    return data;
}

export async function getArticleBySlug(
    slug: string,
): Promise<ApiArticle> {
    const res = await fetch(`${API}/pulse/articles/slug/${encodeURIComponent(slug)}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        const error = new Error("Article not found") as Error & { status?: number };
        error.status = res.status;
        throw error;
    }
    const article = await parseJsonResponse<ApiArticle>(res);
    if (article) {
        return article;
    }

    const fallbackArticles = await getArticles({ limit: 500 });
    const fallbackArticle = fallbackArticles.data.find((item) => item.slug === slug);
    if (fallbackArticle) {
        return fallbackArticle;
    }

    const error = new Error("Article not found") as Error & { status?: number };
    error.status = 404;
    throw error;
}

export async function getFeaturedArticles(): Promise<ApiArticle[]> {
    const res = await fetch(`${API}/pulse/articles/featured`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch featured articles");
    return (await parseJsonResponse<ApiArticle[]>(res)) ?? [];
}

export async function getHeaderArticles(
    position: "left" | "center" | "right" | "week",
): Promise<ApiArticle[]> {
    const res = await fetch(
        `${API}/pulse/articles/header?position=${position}`,
        { next: { revalidate: 60 } },
    );
    if (!res.ok) throw new Error("Failed to fetch header articles");
    return (await parseJsonResponse<ApiArticle[]>(res)) ?? [];
}

export interface PulseCategory {
    id: string;
    name: LocalizedString;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export async function getPulseCategories(): Promise<PulseCategory[]> {
    const res = await fetch(`${API}/pulse/categories`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return (await parseJsonResponse<PulseCategory[]>(res)) ?? [];
}

export async function getAuthors(locale: string = "az"): Promise<ApiAuthor[]> {
    const res = await fetch(`${API}/pulse/authors`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch authors");
    const authors = (await parseJsonResponse<ApiAuthorPayload[]>(res)) ?? [];
    return authors.map((author) => ({
        ...author,
        name: getLocalized(author.name, locale),
        title: getLocalized(author.title, locale),
        description: getLocalized(author.description, locale),
    }));
}

export async function getAuthorBySlug(
    slug: string,
    locale: string = "az",
): Promise<ApiAuthor & { articles: ApiArticle[] }> {
    const res = await fetch(`${API}/pulse/authors/slug/${slug}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Author not found");
    const author = await parseJsonResponse<ApiAuthorPayload & { articles: ApiArticle[] }>(res);
    if (!author) throw new Error("Author not found");
    return {
        ...author,
        name: getLocalized(author.name, locale),
        title: getLocalized(author.title, locale),
        description: getLocalized(author.description, locale),
        articles: author.articles,
    };
}

const ABS_API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10021";

export function toAbsUrl(path: string): string {
    if (!path) return "";

    const rawUrl =
        path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")
            ? path
            : `${ABS_API}${path}`;

    try {
        // Normalize already-encoded avatar/file URLs so `%20` and `%2520`
        // end up as the same valid final asset URL.
        return encodeURI(decodeURI(rawUrl));
    } catch {
        return encodeURI(rawUrl);
    }
}

export function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function resolveArticleDate(api: any): string {
    const candidate = api.date || api.createdAt || api.updatedAt;
    if (!candidate || typeof candidate !== "string") return "";
    const parsed = new Date(candidate);

    if (!parsed || Number.isNaN(parsed.getTime())) {
        return "";
    }

    return formatDate(candidate);
}

export function apiArticleToArticle(api: any, locale: string = "az"): Article {
    // Defensively process the input, ensure all fields are safe
    const safeApi = api || {};
    
    const searchParts = [safeApi.title, safeApi.category, safeApi.excerpt]
        .filter(Boolean)
        .flatMap(v => {
            if (typeof v === "string") return [v];
            if (v && typeof v === "object") return Object.values(v).filter(Boolean) as string[];
            return [];
        });

    return {
        id: safeApi.id,
        slug: safeApi.slug,
        title: getLocalized(safeApi.title, locale),
        category: getLocalized(safeApi.category, locale),
        date: resolveArticleDate(safeApi),
        image: safeApi.coverImage,
        coverImage: safeApi.coverImage,
        author: safeApi.author ? getLocalized(safeApi.author.name, locale) : undefined,
        authorImage: safeApi.author?.avatar,
        authorTitle: safeApi.author ? getLocalized(safeApi.author.title, locale) : undefined,
        authorId: safeApi.authorId,
        authorObj: safeApi.author
            ? {
                id: safeApi.author.id,
                name: getLocalized(safeApi.author.name, locale),
                slug: safeApi.author.slug,
                title: getLocalized(safeApi.author.title, locale),
                linkedin: safeApi.author.linkedin,
                avatar: safeApi.author.avatar,
            }
            : undefined,
        keywords: safeApi.keywords?.map((keyword: any) => ({
            ...keyword,
            name: getLocalized(keyword.name, locale),
        })),
        blocks: safeApi.blocks,
        excerpt: getLocalized(safeApi.excerpt, locale),
        featured: safeApi.featured,
        published: safeApi.published,
        headerPositions: safeApi.headerPositions ?? undefined,
        headerOrder: safeApi.headerOrder ?? undefined,
        selectedArticles: safeApi.selectedArticles?.map((a: any) => apiArticleToArticle(a, locale)),
        metaTitle: getLocalized(safeApi.metaTitle, locale),
        metaDescription: getLocalized(safeApi.metaDescription, locale),
        _searchable: searchParts.join(' ').toLowerCase(),
    };
}
