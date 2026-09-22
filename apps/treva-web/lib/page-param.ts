/**
 * `?page=` helpers for "Show more" lists that grow in client state (Pulse,
 * the about page's team grid). The button is a real `<a href="?page=N">` so
 * crawlers can follow it; these keep the address bar in step with what is
 * on screen and let a direct `?page=N` visit open with N pages shown.
 *
 * Browser-only — call them from effects and event handlers, not during render.
 */

/** The `?page=` in the address bar, or 1 when it is missing or invalid. */
export function readPageParam(): number {
  const raw = Number(new URLSearchParams(window.location.search).get("page"));
  return Number.isInteger(raw) && raw > 1 ? raw : 1;
}

/** Sets `?page=` without a navigation; page 1 drops the param. */
export function writePageParam(page: number): void {
  const url = new URL(window.location.href);
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");
  window.history.replaceState(window.history.state, "", url);
}
