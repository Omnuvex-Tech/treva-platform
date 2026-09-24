import { http } from "@/lib/api/http";
import { endpoints } from "@/config/endpoints";
import type {
    BrokerDocument,
    DocumentCreateInput,
    DocumentInput,
    DocumentListQuery,
} from "../types";

/**
 * Real adapter against apps/treva-broker-api, used while
 * NEXT_PUBLIC_USE_MOCK_BROKER_ROLE is "0". The API answers in these exact
 * shapes (see BrokerRoleService there), so there is no mapping here.
 */
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

/**
 * Multipart: the endpoint stores the file and creates its row in one call. The
 * server reads the size, the kind and the uploader for itself, so nothing else
 * from the input is sent.
 */
export async function create(input: DocumentCreateInput): Promise<BrokerDocument> {
    const form = new FormData();
    form.append("file", input.file);
    if (input.name) form.append("name", input.name);

    // A 60 MB brochure on a slow line outlasts the default 30s.
    return http.post<BrokerDocument>(endpoints.brokerRole.documents, form, {
        timeoutMs: 5 * 60_000,
    });
}

export async function registerDownload(id: string): Promise<BrokerDocument> {
    return http.post<BrokerDocument>(endpoints.brokerRole.download(id));
}

export async function remove(id: string): Promise<void> {
    await http.delete<void>(endpoints.brokerRole.document(id));
}
