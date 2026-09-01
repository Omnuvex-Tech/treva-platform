import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { Project, ProjectListQuery } from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function list(query: ProjectListQuery = {}): Promise<Paginated<Project>> {
    return http.get<Paginated<Project>>(endpoints.projects.list, {
        params: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
        },
    });
}

export async function detail(id: string): Promise<Project> {
    return http.get<Project>(endpoints.projects.detail(id));
}
