/**
 * "Broker Role" is a marketing-materials library, not role administration.
 *
 * The nav label comes from the design, but the artboard (873:49451) is a list
 * of files — brochures, price lists, floor plans, presentations — each with a
 * size, a download count and row actions, plus an edit screen (873:52019) that
 * carries versioning and a set of switches. The types below describe that.
 */

/**
 * The four switches on the edit screen's Visibility card (873:52110).
 *
 * They are independent booleans, not one audience picked from a list: the
 * artboard draws four separate toggles and has two of them on at once ("Active"
 * and "Allow Download"), which a single-choice control could not express. An
 * earlier pass modelled this as an `"all" | "top_broker" | "admin"` union while
 * the labels were still unread; the file settles it.
 */
export const DOCUMENT_FLAGS = ["active", "featured", "allowDownload", "notifyBrokers"] as const;

export type DocumentFlag = (typeof DOCUMENT_FLAGS)[number];

/** What a freshly uploaded file starts with — the artboard's own on/off state. */
export const DEFAULT_DOCUMENT_FLAGS: Record<DocumentFlag, boolean> = {
    active: true,
    featured: false,
    allowDownload: true,
    notifyBrokers: false,
};

export type DocumentKind = "pdf" | "pptx" | "docx" | "xlsx" | "image" | "other";

/**
 * What the two selects on the edit screen (876:13899 / 876:13900) choose.
 *
 * The artboard names its layers generically, so these are read off the library
 * itself rather than off the labels: the six files are a brochure, a price
 * list, floor plans, a presentation, a policy and a checklist, and two of them
 * carry a language marker in the name ("Project Brochure EN", "Прайс-лист RU").
 */
export type DocumentCategory =
    | "brochure"
    | "price_list"
    | "floor_plan"
    | "presentation"
    | "policy"
    | "other";

export type DocumentLanguage = "az" | "en" | "ru";

export interface BrokerDocument {
    id: string;
    name: string;
    kind: DocumentKind;
    category: DocumentCategory;
    language: DocumentLanguage;
    /** Free text under the form's two cards (876:13902). */
    description: string;
    sizeBytes: number;
    downloads: number;
    version: number;
    uploadedBy: string;
    uploadedAt: string;
    updatedAt: string;
    flags: Record<DocumentFlag, boolean>;
    /** Where the file actually lives; empty while the mock adapter is on. */
    url: string;
}

export interface DocumentListQuery {
    search?: string;
}

/**
 * What "Add Files" (873:49824) sends up.
 *
 * The file itself, not metadata about it: POST /broker-role/documents is
 * multipart and stores the bytes and creates the row in one call, so the size,
 * the kind and the stored URL are all read off the upload by the server rather
 * than claimed from here. `lib/api/http` sends a `FormData` body as is.
 *
 * `uploadedBy` is here for the mock's benefit alone — it has no session to read
 * a name from. The real adapter never sends it; the endpoint takes the uploader
 * from the token.
 */
export interface DocumentCreateInput {
    file: File;
    /** The name typed in the modal; empty falls back to the file's own. */
    name: string;
    uploadedBy: string;
}

/** The editable half of a file — everything the edit screen's form owns. */
export interface DocumentInput {
    name: string;
    category: DocumentCategory;
    language: DocumentLanguage;
    description: string;
    flags: Record<DocumentFlag, boolean>;
}
