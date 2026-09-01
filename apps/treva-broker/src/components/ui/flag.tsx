import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

/**
 * The 24x24 round flags from the language dropdown (873:51422).
 *
 * Drawn inline rather than as emoji: Windows has no colour glyphs for
 * regional-indicator pairs, so an emoji flag renders as two grey letters there —
 * which is most of this app's audience. Simplified but recognisable at 24px.
 */
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
    return (
        <span
            className={cn(
                "inline-block size-6 shrink-0 overflow-hidden rounded-pill ring-1 ring-border-subtle",
                className,
            )}
            aria-hidden
        >
            <svg viewBox="0 0 24 24" className="size-full">
                {locale === "az" ? <Azerbaijan /> : locale === "ru" ? <Russia /> : <UnitedKingdom />}
            </svg>
        </span>
    );
}

function Azerbaijan() {
    return (
        <>
            <rect width="24" height="8" fill="#00b5e2" />
            <rect y="8" width="24" height="8" fill="#ef3340" />
            <rect y="16" width="24" height="8" fill="#509e2f" />
            {/* Crescent: a white disc with a red disc offset over it. */}
            <circle cx="11" cy="12" r="3.2" fill="#ffffff" />
            <circle cx="12.4" cy="12" r="2.6" fill="#ef3340" />
            <path d="M15.6 10.4l.55 1.15 1.25.17-.9.86.22 1.24-1.12-.6-1.12.6.22-1.24-.9-.86 1.25-.17z" fill="#ffffff" />
        </>
    );
}

function Russia() {
    return (
        <>
            <rect width="24" height="8" fill="#ffffff" />
            <rect y="8" width="24" height="8" fill="#0039a6" />
            <rect y="16" width="24" height="8" fill="#d52b1e" />
        </>
    );
}

function UnitedKingdom() {
    return (
        <>
            <rect width="24" height="24" fill="#012169" />
            {/* Saltire (diagonals): white first, red laid over it. */}
            <path d="M0 0L24 24M24 0L0 24" stroke="#ffffff" strokeWidth="5" />
            <path d="M0 0L24 24M24 0L0 24" stroke="#c8102e" strokeWidth="2.5" />
            {/* Cross of St George. */}
            <path d="M12 0v24M0 12h24" stroke="#ffffff" strokeWidth="8" />
            <path d="M12 0v24M0 12h24" stroke="#c8102e" strokeWidth="4.5" />
        </>
    );
}
