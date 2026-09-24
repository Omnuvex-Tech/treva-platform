"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/** Where the track sits in the body frame (873:51102): x 1424 of 1440, y 88. */
const TRACK_TOP = 88;
const TRACK_BOTTOM = 8;
const TRACK_RIGHT = 10;
const MIN_THUMB = 24;

/**
 * The scrollable content column, with the artboards' "Scrollbar — Custom"
 * (873:51102) drawn over it instead of the browser's own bar.
 *
 * A native bar takes its width out of the layout, so every page measured to
 * the pixel — the four 260px project cards, the 1112px editor sections — came
 * out ~10px narrower than drawn. Here the native bar is hidden and a 6px pill
 * track (Background/Teritary) with a Border/Tertiary thumb floats above the
 * content, which keeps the full 1160 for the page. Wheel, touch and keyboard
 * scrolling are the element's own; the thumb can also be dragged.
 */
export function ScrollMain({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);
    const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);
    const drag = useRef<{ startY: number; startScroll: number } | null>(null);

    const measure = useCallback(() => {
        const main = mainRef.current;
        if (!main) return;

        const { scrollHeight, clientHeight, scrollTop } = main;
        if (scrollHeight <= clientHeight + 1) {
            setThumb(null);
            return;
        }

        const track = clientHeight - TRACK_TOP - TRACK_BOTTOM;
        const height = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * track);
        const top = (scrollTop / (scrollHeight - clientHeight)) * (track - height);
        setThumb({ top, height });
    }, []);

    useEffect(() => {
        const main = mainRef.current;
        if (!main) return;

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(main);
        // Content growing (a card added, an image loaded) changes the ratio
        // without resizing the column itself.
        for (const child of Array.from(main.children)) observer.observe(child);

        const mutations = new MutationObserver(() => {
            for (const child of Array.from(main.children)) observer.observe(child);
            measure();
        });
        mutations.observe(main, { childList: true });

        return () => {
            observer.disconnect();
            mutations.disconnect();
        };
    }, [measure]);

    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        const main = mainRef.current;
        if (!main) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startY: event.clientY, startScroll: main.scrollTop };
    }

    function onPointerMove(event: PointerEvent<HTMLDivElement>) {
        const main = mainRef.current;
        if (!main || !drag.current || !thumb) return;

        const track = main.clientHeight - TRACK_TOP - TRACK_BOTTOM;
        const ratio = (main.scrollHeight - main.clientHeight) / (track - thumb.height);
        main.scrollTop = drag.current.startScroll + (event.clientY - drag.current.startY) * ratio;
    }

    return (
        <div className="relative min-w-0 flex-1">
            <main
                ref={mainRef}
                onScroll={measure}
                className="scrollbar-none h-full overflow-y-auto bg-bg-app"
            >
                {children}
            </main>

            {thumb ? (
                <div
                    aria-hidden
                    className="absolute w-1.5 rounded-pill bg-bg-tertiary"
                    style={{ top: TRACK_TOP, bottom: TRACK_BOTTOM, right: TRACK_RIGHT }}
                >
                    <div
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={() => (drag.current = null)}
                        className="absolute inset-x-0 cursor-default rounded-pill bg-border-tertiary"
                        style={{ top: thumb.top, height: thumb.height }}
                    />
                </div>
            ) : null}
        </div>
    );
}
