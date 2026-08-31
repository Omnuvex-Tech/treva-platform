import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { Client, ClientInput, ClientListQuery } from "../types";

import * as httpAdapter from "./clients.http";
import * as mockAdapter from "./clients.mock";

export interface ClientsService {
    list(query?: ClientListQuery): Promise<Paginated<Client>>;
    detail(id: string): Promise<Client>;
    create(input: ClientInput): Promise<Client>;
    update(id: string, input: Partial<ClientInput>): Promise<Client>;
    remove(id: string): Promise<void>;
    removeMany(ids: readonly string[]): Promise<void>;
}

export const clientsService: ClientsService = config.api.useMock ? mockAdapter : httpAdapter;
