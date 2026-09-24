import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { NewsInput, NewsListQuery, NewsPost, NewsStats, UploadedFile } from "../types";

import * as httpAdapter from "./news.http";
import * as mockAdapter from "./news.mock";

export interface NewsService {
    list(query?: NewsListQuery): Promise<Paginated<NewsPost>>;
    pinned(): Promise<NewsPost[]>;
    stats(): Promise<NewsStats>;
    detail(id: string): Promise<NewsPost>;
    /** Marks the post read for the signed-in account; idempotent. */
    markRead(id: string): Promise<void>;
    create(input: NewsInput): Promise<NewsPost>;
    update(id: string, input: Partial<NewsInput>): Promise<NewsPost>;
    remove(id: string): Promise<void>;
    /** Stores a cover, attachment or inline image and resolves to where it is served. */
    upload(file: File): Promise<UploadedFile>;
}

/**
 * Both adapters are typed against `NewsService`, so the mock cannot drift from
 * the shape the HTTP adapter promises without failing `check-types`.
 */
export const newsService: NewsService = config.api.useMockNews ? mockAdapter : httpAdapter;
