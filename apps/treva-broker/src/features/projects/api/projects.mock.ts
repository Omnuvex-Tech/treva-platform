import { delay, paginate, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import type { Paginated } from "@/lib/api/types";
import { MOCK_PROJECTS } from "@/mocks/projects";
import { emptyProject } from "../empty-project";
import type { Project, ProjectInput, ProjectListQuery } from "../types";

let projects: Project[] = [...MOCK_PROJECTS];

export async function list(query: ProjectListQuery = {}): Promise<Paginated<Project>> {
    await delay();

    let filtered = searchBy(projects, query.search, ["name", "developer", "location"]);

    if (query.status && query.status !== "all") {
        filtered = filtered.filter((project) => project.status === query.status);
    }

    // 8 per page: the artboard lays cards out four-across in two rows.
    return paginate(filtered, { page: query.page, perPage: query.perPage ?? 8 });
}

export async function detail(id: string): Promise<Project> {
    await delay();

    const project = projects.find((entry) => entry.id === id);
    if (!project) throw new ApiError("Project not found", 404, "not_found");

    return project;
}

export async function create(input: Partial<ProjectInput>): Promise<Project> {
    await delay();

    const project: Project = {
        ...emptyProject(),
        ...input,
        id: `prj_${Date.now().toString(36)}`,
        updatedAt: new Date().toISOString(),
    };

    projects = [project, ...projects];
    return project;
}

export async function update(
    id: string,
    input: Partial<ProjectInput>,
): Promise<Project> {
    await delay();

    const index = projects.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("Project not found", 404, "not_found");

    const current = projects[index]!;
    const updated: Project = { ...current, ...input, updatedAt: new Date().toISOString() };

    projects = projects.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!projects.some((entry) => entry.id === id)) {
        throw new ApiError("Project not found", 404, "not_found");
    }

    projects = projects.filter((entry) => entry.id !== id);
}
