"use client";

import { useEffect, useRef, useState } from "react";
import "../card-image.css";

type Props = { src: string; className?: string; poster?: string };

/**
 * An autoplaying background clip with a spinner over it until it can paint.
 *
 * `poster` is a frame lifted straight out of `src` (see `public/images/figma/
 * *-hero-poster.jpg`), so it matches the footage exactly — the mismatch that
 * made an earlier poster read as a photo swapped for a video does not apply to
 * a still taken from the clip itself. It paints instantly while the file
 * streams; the `.tv-spin` ring still covers the gap before even the poster is
 * decoded, and fades the moment there is a frame. Callers with no frame-exact
 * still omit it and fall back to the container's muted fill.
 *
 * `preload="metadata"` rather than `"auto"`: the clip autoplays, so the browser
 * still fetches it, but it no longer races the CSS and the hydration bundle to
 * grab the whole file up front.
 */
export default function VideoV2({ src, className, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  // A cached clip can already be past `loadeddata` by the time React attaches
  // the handler below, and then the event never fires — check the element
  // once on mount so the spinner doesn't sit over a frame that is already
  // there.
  useEffect(() => {
    if ((ref.current?.readyState ?? 0) >= 2) setReady(true);
  }, []);

  // Unmounted only after the fade has run, so the ring isn't left spinning
  // invisibly for the rest of the session.
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setGone(true), 400);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <>
      <video
        ref={ref}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        onLoadedData={() => setReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {gone ? null : (
        <span className={`tv-spin${ready ? " tv-spin--done" : ""}`} aria-hidden="true" />
      )}
    </>
  );
}
