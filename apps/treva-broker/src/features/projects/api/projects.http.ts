import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";
import { endpoints } from "@/config/endpoints";
import type { Project, ProjectInput, ProjectListQuery, ProjectSyncSummary } from "../types";

/**
 * Real adapter against apps/treva-broker-api, used while
 * NEXT_PUBLIC_USE_MOCK_PROJECTS is "0". The API answers in these exact shapes
 * (see ProjectsService there), so there is no mapping here.
 */
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

export async function create(input: Partial<ProjectInput>): Promise<Project> {
    return http.post<Project>(endpoints.projects.list, input);
}

export async function update(id: string, input: Partial<ProjectInput>): Promise<Project> {
    return http.patch<Project>(endpoints.projects.detail(id), input);
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.projects.detail(id));
}

export async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    // A large hero on a slow line outlasts the default 30s.
    const stored = await http.post<{ url: string }>(endpoints.projects.images, form, {
        timeoutMs: 5 * 60_000,
    });

    return stored.url;
}

export async function uploadIcon(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    const stored = await http.post<{ url: string }>(endpoints.projects.icons, form);

    return stored.url;
}

export async function uploadMaterial(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    // Up to 60 MB (a video); the default 30s is too short on a slow line.
    const stored = await http.post<{ url: string }>(endpoints.projects.materials, form, {
        timeoutMs: 5 * 60_000,
    });

    return stored.url;
}

export async function registerMaterialDownload(id: string, materialId: string): Promise<number> {
    const counted = await http.post<{ downloads: number }>(
        endpoints.projects.materialDownload(id, materialId),
    );

    return counted.downloads;
}

export async function sync(): Promise<ProjectSyncSummary> {
    // A first sync writes a few thousand units; give it longer than the default 30s.
    return http.post<ProjectSyncSummary>(endpoints.projects.sync, undefined, {
        timeoutMs: 5 * 60_000,
    });
}
