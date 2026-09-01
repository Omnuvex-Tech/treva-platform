import { config } from "@/config";
import type { ListingListQuery, ListingSections } from "../types";

import * as httpAdapter from "./listings.http";
import * as mockAdapter from "./listings.mock";

export interface ListingsService {
    sections(query?: ListingListQuery): Promise<ListingSections>;
}

export const listingsService: ListingsService = config.api.useMock ? mockAdapter : httpAdapter;
