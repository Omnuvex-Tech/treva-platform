import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { NewsInput, NewsListQuery, NewsPost, NewsStats } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function list(query: NewsListQuery = {}): Promise<Paginated<NewsPost>> {
    return http.get<Paginated<NewsPost>>(endpoints.news.list, {
        params: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
            category: query.category === "all" ? undefined : query.category,
        },
    });
}

export async function pinned(): Promise<NewsPost[]> {
    return http.get<NewsPost[]>(endpoints.news.list, { params: { pinned: true } });
}

export async function stats(): Promise<NewsStats> {
    return http.get<NewsStats>(endpoints.news.stats);
}

export async function detail(id: string): Promise<NewsPost> {
    return http.get<NewsPost>(endpoints.news.detail(id));
}

export async function create(input: NewsInput): Promise<NewsPost> {
    return http.post<NewsPost>(endpoints.news.list, input);
}

export async function update(id: string, input: Partial<NewsInput>): Promise<NewsPost> {
    return http.patch<NewsPost>(endpoints.news.detail(id), input);
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.news.detail(id));
}
