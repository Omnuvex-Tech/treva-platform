import { config } from "@/config";
import type { Paginated } from "@/lib/api/types";
import type { PlatformUser, UserAgencyLink, UserInput, UserListQuery } from "../types";

import * as httpAdapter from "./users.http";
import * as mockAdapter from "./users.mock";

export interface UsersService {
    list(query?: UserListQuery): Promise<Paginated<PlatformUser>>;
    detail(id: string): Promise<PlatformUser>;
    agencyLink(id: string): Promise<UserAgencyLink | null>;
    create(input: UserInput): Promise<PlatformUser>;
    update(id: string, input: Partial<UserInput>): Promise<PlatformUser>;
    remove(id: string): Promise<void>;
}

export const usersService: UsersService = config.api.useMock ? mockAdapter : httpAdapter;
