import { config } from "@/config";
import type { Agency, AgencyInput, ManagerOption } from "../types";

import * as httpAdapter from "./agencies.http";
import * as mockAdapter from "./agencies.mock";

export interface AgenciesService {
    list(search?: string): Promise<Agency[]>;
    detail(id: string): Promise<Agency>;
    managers(): Promise<ManagerOption[]>;
    create(input: AgencyInput): Promise<Agency>;
    update(id: string, input: Partial<AgencyInput>): Promise<Agency>;
    remove(id: string): Promise<void>;
}

export const agenciesService: AgenciesService = config.api.useMockUsers ? mockAdapter : httpAdapter;
