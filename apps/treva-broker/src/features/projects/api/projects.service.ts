import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { Project, ProjectInput, ProjectListQuery } from "../types";

import * as httpAdapter from "./projects.http";
import * as mockAdapter from "./projects.mock";

export interface ProjectsService {
    list(query?: ProjectListQuery): Promise<Paginated<Project>>;
    detail(id: string): Promise<Project>;
    create(input: Partial<ProjectInput>): Promise<Project>;
    update(id: string, input: Partial<ProjectInput>): Promise<Project>;
    remove(id: string): Promise<void>;
}

export const projectsService: ProjectsService = config.api.useMock ? mockAdapter : httpAdapter;
