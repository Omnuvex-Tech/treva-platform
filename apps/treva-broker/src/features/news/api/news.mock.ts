import { delay, paginate, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { MOCK_NEWS, MOCK_NEWS_STATS } from "@/mocks/news";
import { EMPTY_VISIBILITY, type NewsInput, type NewsListQuery, type NewsPost, type NewsStats } from "../types";

/**
 * In-memory store. Mutations are applied to this array so create/edit/delete
 * feel real across a session — a page reload resets it, which is the intended
 * behaviour for a fixture backend.
 */
let posts: NewsPost[] = [...MOCK_NEWS];

export async function list(query: NewsListQuery = {}): Promise<Paginated<NewsPost>> {
    await delay();

    let filtered = searchBy(posts, query.search, ["title", "excerpt", "authorName"]);

    if (query.category && query.category !== "all") {
        filtered = filtered.filter((post) => post.category === query.category);
    }

    // Pinned posts float to the top, then newest first — the order the design
    // shows, where the pinned announcement sits in its own rail.
    filtered.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 6 });
}

export async function pinned(): Promise<NewsPost[]> {
    await delay(180);
    return posts.filter((post) => post.pinned);
}

export async function stats(): Promise<NewsStats> {
    await delay(180);
    return MOCK_NEWS_STATS;
}

export async function detail(id: string): Promise<NewsPost> {
    await delay();

    const post = posts.find((entry) => entry.id === id);
    if (!post) throw new ApiError("News post not found", 404, "not_found");

    return post;
}

export async function create(input: NewsInput): Promise<NewsPost> {
    await delay();

    const post: NewsPost = {
        id: `news_${Date.now()}`,
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        category: input.category,
        coverImageUrl: input.coverImageUrl ?? null,
        publishedAt: new Date().toISOString(),
        pinned: input.pinned ?? false,
        authorName: "You",
        status: input.status ?? "draft",
        attachments: input.attachments ?? [],
        visibility: input.visibility ?? EMPTY_VISIBILITY,
        publishAt: input.publishAt ?? "",
        expiresAt: input.expiresAt ?? "",
    };

    posts = [post, ...posts];
    return post;
}

export async function update(id: string, input: Partial<NewsInput>): Promise<NewsPost> {
    await delay();

    const index = posts.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("News post not found", 404, "not_found");

    const updated: NewsPost = { ...posts[index]!, ...input };
    posts = posts.map((entry, entryIndex) => (entryIndex === index ? updated : entry));

    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!posts.some((entry) => entry.id === id)) {
        throw new ApiError("News post not found", 404, "not_found");
    }

    posts = posts.filter((entry) => entry.id !== id);
}
