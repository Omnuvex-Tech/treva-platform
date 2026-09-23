import type { DocumentKind } from '../generated/prisma/client';

/**
 * Which glyph-free `kind` a stored file gets — treva-broker's `DocumentKind`.
 *
 * Office files carry a generic MIME type often enough that the extension is the
 * more reliable signal; images and PDFs are the other way round. This mirrors
 * `kindFor` in treva-broker's Broker Role view, but the server decides: the
 * client's own guess is never trusted.
 */
export function kindForUpload(
  mimeType: string,
  fileName: string,
): DocumentKind {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (/\.pptx?$/i.test(fileName)) return 'pptx';
  if (/\.docx?$/i.test(fileName)) return 'docx';
  if (/\.xlsx?$/i.test(fileName)) return 'xlsx';
  return 'other';
}
