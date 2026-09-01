/**
 * "Broker Role" is a marketing-materials library, not role administration.
 *
 * The nav label comes from the design, but the artboard (873:49451) is a list
 * of files — brochures, price lists, floor plans, presentations — each with a
 * size, a download count and row actions, plus a detail screen (873:52019) that
 * carries versioning and a visibility setting. The types below describe that.
 */
export type DocumentVisibility = "all" | "top_broker" | "admin";

export type DocumentKind = "pdf" | "pptx" | "docx" | "xlsx" | "image" | "other";

export interface BrokerDocument {
    id: string;
    name: string;
    kind: DocumentKind;
    sizeBytes: number;
    downloads: number;
    version: number;
    uploadedBy: string;
    uploadedAt: string;
    updatedAt: string;
    visibility: DocumentVisibility;
    /** Where the file actually lives; empty while the mock adapter is on. */
    url: string;
}

export interface DocumentListQuery {
    search?: string;
}
