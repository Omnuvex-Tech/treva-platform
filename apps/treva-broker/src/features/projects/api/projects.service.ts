import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { Project, ProjectInput, ProjectListQuery, ProjectSyncSummary } from "../types";

import * as httpAdapter from "./projects.http";
import * as mockAdapter from "./projects.mock";

export interface ProjectsService {
    list(query?: ProjectListQuery): Promise<Paginated<Project>>;
    detail(id: string): Promise<Project>;
    create(input: Partial<ProjectInput>): Promise<Project>;
    update(id: string, input: Partial<ProjectInput>): Promise<Project>;
    remove(id: string): Promise<void>;
    /** Stores one gallery image and answers with the URL to save on the project. */
    uploadImage(file: File): Promise<string>;
    /** Stores one Key Highlights icon (SVG allowed) and answers with its URL. */
    uploadIcon(file: File): Promise<string>;
    /** Stores one Marketing Materials file and answers with its URL. */
    uploadMaterial(file: File): Promise<string>;
    /** Counts one download of a saved Marketing Materials file; answers with the new count. */
    registerMaterialDownload(id: string, materialId: string): Promise<number>;
    /**
     * Copies treva-api's off-plan projects, buildings and units into the broker's
     * own database; Floor Plan and the project screens read that copy.
     */
    sync(): Promise<ProjectSyncSummary>;
}

export const projectsService: ProjectsService = config.api.useMockProjects
    ? mockAdapter
    : httpAdapter;
