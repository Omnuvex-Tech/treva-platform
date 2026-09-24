"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";

/**
 * The page every sign-up step is drawn on: the centred 540px column, the pale
 * swirl behind it, the card itself, and the legal line under it.
 *
 * It lives above the step components rather than inside each of them because
 * it is the one thing that must NOT remount between steps — a card that is
 * thrown away and rebuilt can only cut from one size to the next. Here it is
 * kept, its height measured off whatever step is currently inside it and set
 * explicitly, so changing steps (or unfolding the company block within one)
 * animates the card from its old height to its new one. The column centres it,
 * so growing also slides it back into the middle of the screen.
 */
export function RegisterShell({ children }: { children: ReactNode }) {
    const { locale, t } = useI18n();
    const copy = t.auth.registerType;

    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | null>(null);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        // Observing the CONTENT, not the card, is what makes every case work
        // from one place: a step swap replaces the content, the company block
        // unfolding resizes it, a reflow at a new window width resizes it —
        // and each time the card is simply handed the number to animate to.
        const observer = new ResizeObserver(() => {
            setHeight(content.getBoundingClientRect().height);
        });
        observer.observe(content);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-12">
            {/* The artboard lays a pale swirl behind the card; it is artwork, not
                a token, so it is stood in for the same way the auth brand panel
                does rather than shipped as a raster. */}
            <div
                aria-hidden
                className="pointer-events-none fixed -top-1/3 -left-1/4 -z-10 size-[120vh] rounded-pill bg-bg-secondary/60 blur-3xl"
            />

            <div className="w-full max-w-[540px]">
                <div
                    // `box-content` so the measured number lands on the content
                    // box: the app is border-box everywhere, and under that the
                    // card's own 1px edges would eat two pixels off the bottom
                    // of whatever step is inside it.
                    className="box-content overflow-hidden rounded-lg border border-border-subtle bg-bg-primary shadow-l2 motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-out"
                    // Until the first measurement lands the card is its natural
                    // height, so the first paint is already right — and `auto`
                    // is not a length, so that first hand-off cannot animate.
                    style={height === null ? undefined : { height }}
                >
                    <div ref={contentRef}>{children}</div>
                </div>

                <p className="pt-4 text-center text-xs text-[var(--color-content-tertiary-inverse)]">
                    {copy.legalPrefix}{" "}
                    <Link href={routes.login(locale)} className="text-content-tertiary underline">
                        {copy.terms}
                    </Link>{" "}
                    {copy.legalAnd}{" "}
                    <Link href={routes.login(locale)} className="text-content-tertiary underline">
                        {copy.privacy}
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
