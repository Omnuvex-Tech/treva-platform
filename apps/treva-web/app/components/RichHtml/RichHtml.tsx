"use client";

import { useEffect, useRef } from "react";
import { toAbsUrl } from "@/lib/pulse-api";
import "./rich-html.css";

const ARROW_LEFT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const ARROW_RIGHT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

/**
 * Fayllar API host-unda dayanır, ünvanlar isə nisbi saxlanılır — bağlanmasa,
 * brauzer onları treva-web domenində axtarar və tapmaz.
 */
function absolutizeMedia(html: string): string {
    return html.replace(
        /(src|href)="(\/uploads\/[^"]*)"/g,
        (_match, attribute: string, path: string) => `${attribute}="${toAbsUrl(path)}"`,
    );
}

/**
 * Slider redaktordan sadə scroll-snap zolağı kimi gəlir: barmaqla və siçan
 * təkəri ilə işləyir, amma masaüstündə basılası bir şey yoxdur. Düymələri
 * burada, render-dən sonra əlavə edirik ki, saxlanılan HTML təmiz qalsın.
 */
function attachSliderArrows(root: HTMLElement): () => void {
    const cleanups: Array<() => void> = [];

    root.querySelectorAll<HTMLElement>(".treva-slider").forEach((track) => {
        const parent = track.parentElement;
        if (!parent || parent.classList.contains("treva-slider-wrap")) return;

        const wrap = document.createElement("div");
        wrap.className = "treva-slider-wrap";
        parent.insertBefore(wrap, track);
        wrap.appendChild(track);

        const step = () => {
            const slide = track.firstElementChild as HTMLElement | null;
            return slide ? slide.offsetWidth + 8 : track.clientWidth;
        };

        const makeButton = (direction: "prev" | "next") => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `treva-slider-nav treva-slider-nav--${direction}`;
            button.innerHTML = direction === "prev" ? ARROW_LEFT : ARROW_RIGHT;
            button.setAttribute("aria-label", direction === "prev" ? "Əvvəlki şəkil" : "Növbəti şəkil");

            const onClick = () => {
                track.scrollBy({ left: direction === "prev" ? -step() : step(), behavior: "smooth" });
            };

            button.addEventListener("click", onClick);
            cleanups.push(() => button.removeEventListener("click", onClick));
            wrap.appendChild(button);

            return button;
        };

        const previous = makeButton("prev");
        const next = makeButton("next");

        const syncDisabled = () => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            previous.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= maxScroll - 1;
        };

        syncDisabled();
        track.addEventListener("scroll", syncDisabled, { passive: true });
        window.addEventListener("resize", syncDisabled);

        cleanups.push(() => {
            track.removeEventListener("scroll", syncDisabled);
            window.removeEventListener("resize", syncDisabled);
        });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
}

interface RichHtmlProps {
    html: string;
    className?: string;
    style?: React.CSSProperties;
}

/** CMS-in yazdığı HTML-i göstərir: ünvanları bağlayır, slider-ə düymə verir. */
export default function RichHtml({ html, className, style }: RichHtmlProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        return attachSliderArrows(container);
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={style}
            dangerouslySetInnerHTML={{ __html: absolutizeMedia(html) }}
        />
    );
}
