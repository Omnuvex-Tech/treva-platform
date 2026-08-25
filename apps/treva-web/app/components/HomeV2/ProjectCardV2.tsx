"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { ProjectCard } from "./data";

type Props = {
  item: ProjectCard;
  locale: string;
  startingFromLabel: string;
};

const MEDIA_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * Reproduces Figma's fill placement on an image that also uses `fill`.
 *
 * The obvious spelling — width/height/left/top percentages straight off the
 * design — is rejected outright: next/image refuses `fill` together with an
 * explicit `style.width`. The same geometry goes through as a transform
 * instead. `objectFit: "fill"` first stretches the render into the 430x312
 * window, and the non-uniform scale then pulls it back out to its true 16:9,
 * so the pair lands exactly where the designer dragged it. Origin and the
 * hover zoom are handled in CSS.
 */
function cropStyle(crop: ProjectCard["crop"]): CSSProperties {
  if (!crop) return { objectFit: "cover" };

  return {
    objectFit: "fill",
    transform: `translate(${crop.left}%, ${crop.top}%) scale(${crop.width / 100}, ${crop.height / 100})`,
  };
}

/**
 * Project card — Figma node 425:5213, 432x444.
 *
 * The design composites two separate photos rather than one, which is the whole
 * trick behind the look:
 *
 *   __frame  the 432x400 rounded body, starting 44px down the card. It carries
 *            the sky photo, and that sky is what the translucent footer sits on
 *            — which is why every card's footer picks up its own tint.
 *   __media  the 430x312 cover, lifted 44px clear of the frame. The render is a
 *            cut-out on transparency, so in that top 44px only the tower itself
 *            shows against the page while the rest stays see-through. It is a
 *            sibling of the frame, not a child: the frame clips to its radius.
 *   __body   the 430x132 footer at rgba(253,253,253,0.8) over that sky.
 *
 * Cards still on a flat photo pass no `sky`, so the cover doubles as the
 * backdrop and they degrade to an ordinary opaque card.
 *
 * `preload="none"` matters: the clips run to several MB each and the grid holds
 * six of them, so nothing is fetched until a card is actually hovered, and the
 * <video> only mounts after that first hover for the same reason.
 */
export default function ProjectCardV2({ item, locale, startingFromLabel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);

  // The CMS slot takes a GIF just as happily as a clip, and a GIF is an <img>,
  // not a <video>. The extension is the only thing that separates them.
  const media = item.video ?? "";
  const isGif = /\.gif(\?.*)?$/i.test(media);
  const mediaType = /\.webm(\?.*)?$/i.test(media) ? "video/webm" : "video/mp4";

  const start = useCallback(() => {
    if (!media) return;

    // Honour the OS "reduce motion" setting — no auto-playing footage there.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    setPlaying(true);
  }, [media]);

  const stop = useCallback(() => {
    setPlaying(false);
    // A GIF cannot be paused, so it is unmounted instead — which also means the
    // next hover replays it from the first frame rather than mid-loop.
    if (isGif) {
      setArmed(false);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, [isGif]);

  // Playback waits for the element: the <video> only mounts once `armed` flips,
  // so calling play() inside the hover handler would hit a ref that is still
  // null on the very first hover. play() rejects if the browser blocks it —
  // then the card just keeps the still cover.
  useEffect(() => {
    if (!playing || isGif) return;
    videoRef.current?.play().catch(() => setPlaying(false));
  }, [playing, isGif]);

  return (
    <Link
      href={`/${locale}/projects/${item.slug}`}
      className="hv2-pcard"
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
    >
      <div className="hv2-pcard__frame">
        <Image
          className="hv2-pcard__sky"
          src={item.sky ?? item.image}
          alt=""
          aria-hidden="true"
          fill
          sizes={MEDIA_SIZES}
        />

        <div className="hv2-pcard__body">
          <div className="hv2-pcard__info">
            <h3 className="hv2-pcard__title">{item.title}</h3>

            {/* `unoptimized`: the image optimizer rejects SVG unless
                `dangerouslyAllowSVG` is set globally, and serving one 1.4KB
                glyph as-is is cheaper than loosening that site-wide. */}
            <p className="hv2-pcard__dev">
              {item.icon ? (
                <Image
                  className="hv2-pcard__dev-icon"
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                />
              ) : (
                <MapPin className="hv2-pcard__dev-icon" size={24} strokeWidth={1.5} />
              )}
              {item.developer}
            </p>

            <p className="hv2-pcard__price">
              {startingFromLabel} {item.startingFrom}
            </p>
          </div>

          <span className="hv2-pcard__area">{item.areaRange}</span>
        </div>
      </div>

      <div className="hv2-pcard__media">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes={MEDIA_SIZES}
          style={cropStyle(item.crop)}
        />
      </div>

      {media && armed ? (
        isGif ? (
          // next/image freezes an animated GIF into a single frame, so the file
          // is served raw here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="hv2-pcard__video"
            data-playing={playing ? "true" : "false"}
            src={media}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <video
            ref={videoRef}
            className="hv2-pcard__video"
            data-playing={playing ? "true" : "false"}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          >
            <source src={media} type={mediaType} />
          </video>
        )
      ) : null}
    </Link>
  );
}
