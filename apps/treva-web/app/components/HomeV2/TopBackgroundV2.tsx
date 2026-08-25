"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * The `--hv2-bg` tint, positioned to start at the search card's vertical
 * midpoint and run to the bottom of the page — so the navbar and hero sit on
 * `.hv2-root`'s own white, and the card reads as floating half in white, half
 * in the tint, whose rounded top corners show right at that seam. The split
 * point rides on the search card's actual height rather than a guessed pixel
 * figure: its filter row wraps differently per breakpoint (and content is
 * translated), so a fixed number would drift the moment either changed.
 */
export default function TopBackgroundV2() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const bg = ref.current;
    const root = document.querySelector<HTMLElement>(".hv2-root");
    const search = document.querySelector<HTMLElement>(".hv2-search");
    if (!bg || !root || !search) return;

    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      const searchRect = search.getBoundingClientRect();
      const top = searchRect.top - rootTop + searchRect.height / 2;
      bg.style.top = `${Math.max(0, Math.round(top))}px`;
    };

    update();
    // Observing `.hv2-root` rather than just the search card: a reflow
    // anywhere above it (the hero's video poster resolving, a web font
    // swapping in, the responsive column stack at ≤1024) shifts the split
    // point even when the search card's own box never changes size.
    const observer = new ResizeObserver(update);
    observer.observe(root);
    window.addEventListener("resize", update);
    window.addEventListener("load", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
    };
  }, []);

  return <div ref={ref} className="hv2-topbg" aria-hidden="true" />;
}
