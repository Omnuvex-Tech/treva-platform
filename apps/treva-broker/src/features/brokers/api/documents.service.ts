import { config } from "@/config";
import type {
    BrokerDocument,
    DocumentCreateInput,
    DocumentInput,
    DocumentListQuery,
} from "../types";

import * as httpAdapter from "./documents.http";
import * as mockAdapter from "./documents.mock";

export interface DocumentsService {
    list(query?: DocumentListQuery): Promise<BrokerDocument[]>;
    detail(id: string): Promise<BrokerDocument>;
    create(input: DocumentCreateInput): Promise<BrokerDocument>;
    update(id: string, input: Partial<DocumentInput>): Promise<BrokerDocument>;
    registerDownload(id: string): Promise<BrokerDocument>;
    remove(id: string): Promise<void>;
}

export const documentsService: DocumentsService = config.api.useMock ? mockAdapter : httpAdapter;
