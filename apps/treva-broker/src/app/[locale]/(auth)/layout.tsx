import type { ReactNode } from "react";

/**
 * Auth screens are full-bleed and chrome-free: no sidebar, no header. The
 * off-white arc echoes the decorative swoosh behind the Welcome artboards
 * without shipping an image for it.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg-primary px-6">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-1/3 -left-1/4 size-[140vh] rounded-pill bg-bg-secondary/60"
            />
            <div className="relative w-full max-w-105">{children}</div>
        </div>
    );
}
