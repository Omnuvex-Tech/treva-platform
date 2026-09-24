import type { DocumentKind } from "./types";

/**
 * Which `kind` a picked file gets.
 *
 * Office files carry a generic MIME type often enough that the extension is the
 * more reliable signal; images and PDFs are the other way round.
 *
 * Only the mock adapter calls this: against the real API the server derives the
 * kind from the upload itself (`src/broker-role/kind.ts` in treva-broker-api,
 * the same rules) and never trusts a client's guess. Change both together.
 */
export function kindFor(file: File): DocumentKind {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (/\.pptx?$/i.test(file.name)) return "pptx";
    if (/\.docx?$/i.test(file.name)) return "docx";
    if (/\.xlsx?$/i.test(file.name)) return "xlsx";
    return "other";
}
