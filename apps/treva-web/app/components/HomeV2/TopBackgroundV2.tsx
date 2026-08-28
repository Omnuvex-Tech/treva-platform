"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * The span the tint's top edge halves. `from` is the block it starts
 * measuring at; `to` (when the span is more than one box tall) the block it
 * stops at — the split lands midway between `from`'s top and `to`'s bottom.
 */
export type BgAnchor = { from: string; to?: string };

type Props = {
  /**
   * Anchors tried in order — the first whose `from` is present in the DOM
   * wins. A list rather than one entry because the comparison page's anchor
   * (its first card) only exists once localStorage has been read, and an
   * empty board has to fall back to something further down the page.
   */
  anchors?: BgAnchor[];
};

/** Home: the search card. */
const DEFAULT_ANCHORS: BgAnchor[] = [{ from: ".hv2-search" }];

/**
 * The `--hv2-bg` tint, positioned to start at its anchor's vertical midpoint
 * and run to the bottom of the page — so the navbar and hero sit on
 * `.hv2-root`'s own white, and the anchor reads as floating half in white,
 * half in the tint, whose rounded top corners show right at that seam. The
 * split point rides on the anchor's actual height rather than a guessed pixel
 * figure: layout wraps differently per breakpoint (and content is translated),
 * so a fixed number would drift the moment either changed.
 */
export default function TopBackgroundV2({ anchors = DEFAULT_ANCHORS }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // The array is a fresh literal on every render of the parent, so the effect
  // keys off its contents instead — otherwise it would tear down and re-run
  // the observers on each pass.
  const key = JSON.stringify(anchors);

  useLayoutEffect(() => {
    const bg = ref.current;
    const root = document.querySelector<HTMLElement>(".hv2-root");
    if (!bg || !root) return;
    const list: BgAnchor[] = JSON.parse(key);

    let last = "";
    const update = () => {
      let start: HTMLElement | null = null;
      let end: HTMLElement | null = null;
      for (const anchor of list) {
        start = document.querySelector<HTMLElement>(anchor.from);
        if (!start) continue;
        // A missing `to` is not a reason to skip the anchor — the span just
        // falls back to `from`'s own box.
        end = anchor.to ? document.querySelector<HTMLElement>(anchor.to) : null;
        break;
      }
      if (!start) return;
      const rootTop = root.getBoundingClientRect().top;
      const spanTop = start.getBoundingClientRect().top;
      const spanBottom = (end ?? start).getBoundingClientRect().bottom;
      const top = Math.max(0, Math.round((spanTop + spanBottom) / 2 - rootTop));
      const next = `${top}px`;
      // Writing unconditionally would feed the MutationObserver below its own
      // output on every pass.
      if (next === last) return;
      last = next;
      bg.style.top = next;
    };

    update();
    // Observing `.hv2-root` rather than just the anchor: a reflow anywhere
    // above it (the responsive column stack at ≤1024, say) shifts the split
    // point even when the anchor's own box never changes size.
    const resize = new ResizeObserver(update);
    resize.observe(root);
    // And the anchor itself can appear or disappear after mount — the
    // comparison board renders from localStorage in an effect, and every
    // remove button can empty it back out. Attributes are deliberately not
    // observed, so this never sees the `style` write above.
    const mutations = new MutationObserver(update);
    mutations.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    // Images are the reflow the observers above miss in practice: an office
    // card or a hero poster resolving moves everything below it without any
    // DOM mutation, and on a client-side route change window's own `load` has
    // long since fired. `load` doesn't bubble from <img>, hence the capture
    // phase. Fonts swapping in shift the same boxes, so `fonts.ready` gets a
    // pass too — the effect can outlive that promise, so it re-checks that it
    // is still mounted.
    root.addEventListener("load", update, true);
    window.addEventListener("load", update);
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) update();
    });

    return () => {
      live = false;
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", update);
      root.removeEventListener("load", update, true);
      window.removeEventListener("load", update);
    };
  }, [key]);

  return <div ref={ref} className="hv2-topbg" aria-hidden="true" />;
}
