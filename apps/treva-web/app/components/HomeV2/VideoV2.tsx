"use client";

import { useEffect, useRef, useState } from "react";
import "../card-image.css";

type Props = { src: string; className?: string };

/**
 * An autoplaying background clip with a spinner over it until it can paint.
 *
 * Neither hero carries a poster any more — the stills on file are different
 * scenes from the footage, so the page read as loading a photo and then
 * swapping it out. Without one the <video> box is simply empty while the file
 * downloads, which is what this fills: the shared `.tv-spin` ring sits on the
 * container's own muted fill and fades off the moment there is a frame.
 */
export default function VideoV2({ src, className }: Props) {
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
        preload="auto"
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
