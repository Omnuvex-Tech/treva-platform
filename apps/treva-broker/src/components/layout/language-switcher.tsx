"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils/cn";
import { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { stripLocale } from "@/config/page-meta";
import { useI18n } from "@/providers/i18n-provider";

/** The `EN` chip in the app header, with the az / en / ru picker behind it. */
export function LanguageSwitcher() {
    const { locale } = useI18n();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function switchTo(next: Locale) {
        setOpen(false);
        if (next === locale) return;

        // Written client-side so the choice survives a later visit to a bare
        // path — the middleware reads this cookie to pick the redirect target.
        document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;

        startTransition(() => {
            router.push(`/${next}${stripLocale(pathname)}`);
            router.refresh();
        });
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                disabled={pending}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    "flex h-11 items-center justify-center rounded-md bg-bg-secondary px-3 text-xs font-semibold text-content-secondary",
                    "transition-colors hover:bg-bg-tertiary disabled:opacity-60",
                )}
            >
                {LOCALE_LABELS[locale].short}
            </button>

            {open ? (
                <>
                    {/* Click-away catcher — cheaper and more predictable than a
                        document listener that has to ignore the trigger itself. */}
                    <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setOpen(false)}
                    />

                    <ul
                        role="listbox"
                        className="absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-md border border-border-subtle bg-bg-primary py-1 shadow-l7"
                    >
                        {LOCALES.map((code) => (
                            <li key={code}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={code === locale}
                                    onClick={() => switchTo(code)}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                                        code === locale
                                            ? "bg-bg-secondary text-content-primary"
                                            : "text-content-secondary hover:bg-bg-secondary",
                                    )}
                                >
                                    {LOCALE_LABELS[code].native}
                                    <span className="text-2xs font-semibold text-content-tertiary">
                                        {LOCALE_LABELS[code].short}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : null}
        </div>
    );
}
