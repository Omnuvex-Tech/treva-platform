"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import "./card-image.css";

/**
 * A card image that keeps a spinner in its own frame until the file arrives —
 * the same ring the hero video shows (`.tv-spin`, in card-image.css).
 *
 * The frame it sits in has to be a containing block (`position: relative`),
 * which every card media box already is for the image's own `fill`.
 */
export default function CardImage(props: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [gone, setGone] = useState(false);

  // Listening on the element rather than through `onLoad`: next/image only
  // calls that prop once `img.decode()` resolves, so a picture the browser has
  // already painted (a cached one) or one it gives up on would leave the ring
  // turning over it forever. `error` settles it for the same reason — a broken
  // URL is not a reason to spin.
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (img.complete) {
      setLoaded(true);
      return;
    }
    const settle = () => setLoaded(true);
    img.addEventListener("load", settle);
    img.addEventListener("error", settle);
    return () => {
      img.removeEventListener("load", settle);
      img.removeEventListener("error", settle);
    };
  }, [props.src]);

  // Unmounted after the fade, so nothing is left spinning invisibly.
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => setGone(true), 400);
    return () => window.clearTimeout(timer);
  }, [loaded]);

  return (
    <>
      <Image {...props} ref={ref} />
      {gone ? null : (
        <span className={`tv-spin${loaded ? " tv-spin--done" : ""}`} aria-hidden="true" />
      )}
    </>
  );
}
