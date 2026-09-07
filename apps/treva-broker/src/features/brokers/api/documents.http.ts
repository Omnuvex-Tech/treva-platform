import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type {
    BrokerDocument,
    DocumentCreateInput,
    DocumentInput,
    DocumentListQuery,
} from "../types";

/** Real adapter — see the note in features/auth/api/auth.http.ts. */
export async function list(query: DocumentListQuery = {}): Promise<BrokerDocument[]> {
    return http.get<BrokerDocument[]>(endpoints.brokerRole.documents, {
        params: { search: query.search },
    });
}

export async function detail(id: string): Promise<BrokerDocument> {
    return http.get<BrokerDocument>(endpoints.brokerRole.document(id));
}

export async function update(id: string, input: Partial<DocumentInput>): Promise<BrokerDocument> {
    return http.patch<BrokerDocument>(endpoints.brokerRole.document(id), input);
}

export async function create(input: DocumentCreateInput): Promise<BrokerDocument> {
    return http.post<BrokerDocument>(endpoints.brokerRole.documents, input);
}

export async function registerDownload(id: string): Promise<BrokerDocument> {
    return http.post<BrokerDocument>(endpoints.brokerRole.download(id));
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.brokerRole.document(id));
}
