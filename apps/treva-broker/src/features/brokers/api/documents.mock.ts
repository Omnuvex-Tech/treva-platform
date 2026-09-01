import { delay, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_DOCUMENTS } from "@/mocks/documents";
import type { BrokerDocument, DocumentListQuery, DocumentVisibility } from "../types";

let documents: BrokerDocument[] = [...MOCK_DOCUMENTS];

export async function list(query: DocumentListQuery = {}): Promise<BrokerDocument[]> {
    await delay();

    const filtered = searchBy(documents, query.search, ["name", "uploadedBy"]);
    return [...filtered].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function detail(id: string): Promise<BrokerDocument> {
    await delay();

    const document = documents.find((entry) => entry.id === id);
    if (!document) throw new ApiError("File not found", 404, "not_found");

    return document;
}

export async function setVisibility(
    id: string,
    visibility: DocumentVisibility,
): Promise<BrokerDocument> {
    await delay();

    const index = documents.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("File not found", 404, "not_found");

    const updated: BrokerDocument = {
        ...documents[index]!,
        visibility,
        updatedAt: new Date().toISOString(),
    };

    documents = documents.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

/** Counts a download. The real endpoint does this server-side on file access. */
export async function registerDownload(id: string): Promise<BrokerDocument> {
    await delay(120);

    const index = documents.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("File not found", 404, "not_found");

    const updated: BrokerDocument = {
        ...documents[index]!,
        downloads: documents[index]!.downloads + 1,
    };

    documents = documents.map((entry, entryIndex) => (entryIndex === index ? updated : entry));
    return updated;
}

export async function remove(id: string): Promise<void> {
    await delay();

    if (!documents.some((entry) => entry.id === id)) {
        throw new ApiError("File not found", 404, "not_found");
    }

    documents = documents.filter((entry) => entry.id !== id);
}
