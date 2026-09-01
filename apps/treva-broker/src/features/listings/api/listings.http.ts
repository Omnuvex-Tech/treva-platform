import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type { ListingListQuery, ListingSections } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function sections(query: ListingListQuery = {}): Promise<ListingSections> {
    return http.get<ListingSections>(endpoints.listings.sections, {
        params: {
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
        },
    });
}
