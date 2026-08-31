import type { PageQuery, Paginated } from "./types";

/**
 * Helpers shared by every `*.mock.ts` adapter. Their job is to make the mock
 * behave enough like a network call that the UI built against it does not fall
 * apart when the real API arrives: loading states get a chance to render,
 * pagination is real, and search actually filters.
 */

/** Simulated round-trip so skeletons and spinners are exercised in dev. */
export function delay(ms = 320): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function paginate<T>(items: readonly T[], query: PageQuery = {}): Paginated<T> {
    const perPage = Math.max(1, query.perPage ?? 10);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
    const start = (page - 1) * perPage;

    return {
        items: items.slice(start, start + perPage),
        page,
        perPage,
        total,
        totalPages,
    };
}

/** Case-insensitive contains-match across the given fields. */
export function searchBy<T>(items: readonly T[], term: string | undefined, fields: (keyof T)[]): T[] {
    const needle = term?.trim().toLowerCase();
    if (!needle) return [...items];

    return items.filter((item) =>
        fields.some((field) => String(item[field] ?? "").toLowerCase().includes(needle)),
    );
}
