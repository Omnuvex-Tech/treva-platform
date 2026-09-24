/**
 * How an article body written in the News Content editor reads outside it — on
 * the detail page and in the editor's Preview.
 *
 * The body is the shared Tiptap editor's HTML, and Tailwind's preflight strips
 * every block style from it, so these give back what the editor produces:
 * headings, lists, quotes, links, and images (which carry their own width).
 * Paragraphs are 16px apart, as in the artboard's body (920:11716).
 */
export const newsRichTextClass =
    "text-sm leading-5 [&_a]:text-content-link [&_a]:underline [&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border-tertiary [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:mt-3 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&>:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_video]:my-3 [&_video]:max-w-full [&_video]:rounded-md";
