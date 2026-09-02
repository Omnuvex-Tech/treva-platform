import { delay, searchBy } from "@/lib/api/mock";
import { ApiError } from "@/lib/api/errors";
import { MOCK_DOCUMENTS } from "@/mocks/documents";
import {
    DEFAULT_DOCUMENT_FLAGS,
    type BrokerDocument,
    type DocumentCreateInput,
    type DocumentInput,
    type DocumentListQuery,
} from "../types";

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

/**
 * "Add Files" (873:49824) collects a name and the file and nothing else, so a
 * new row starts on neutral values: the category, the language and the
 * description are what the edit screen (873:52019) exists to fill in. The real
 * endpoint stamps the same defaults, along with the uploader and the clock.
 */
export async function create(input: DocumentCreateInput): Promise<BrokerDocument> {
    await delay();

    const now = new Date().toISOString();
    const document: BrokerDocument = {
        id: `doc_${Date.now().toString(36)}`,
        name: input.name,
        kind: input.kind,
        category: "other",
        language: "en",
        description: "",
        sizeBytes: input.sizeBytes,
        downloads: 0,
        version: 1,
        uploadedBy: input.uploadedBy,
        uploadedAt: now,
        updatedAt: now,
        flags: { ...DEFAULT_DOCUMENT_FLAGS },
        url: "",
    };

    documents = [document, ...documents];
    return document;
}

export async function update(id: string, input: Partial<DocumentInput>): Promise<BrokerDocument> {
    await delay();

    const index = documents.findIndex((entry) => entry.id === id);
    if (index === -1) throw new ApiError("File not found", 404, "not_found");

    const current = documents[index]!;
    const updated: BrokerDocument = {
        ...current,
        ...input,
        // The rail shows a version and a "Last Modified" (873:52070/873:52085),
        // so saving has to move both. The real endpoint owns this; the mock
        // mirrors it so the screen can be reviewed end to end.
        version: current.version + 1,
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
