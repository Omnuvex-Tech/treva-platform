import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

/**
 * Auth screens are a 1:1 visual copy of the treva-inventory login
 * (inventory.treva.realestate/login): same split, same spacing, same colours,
 * same system font stack — only the text content is TREVA Broker's own
 * (pulled from the i18n dictionary instead of hardcoded English).
 */
// Tailwind's default sans stack — not this app's `font-sans` utility, which
// is remapped to Oak Sans. inventory ships no custom font, so matching it
// pixel-for-pixel means reproducing that default stack explicitly here.
const SYSTEM_FONT_STACK =
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

// inventory inherits Tailwind's own body defaults (16px/24px); this app's
// `body` sets 14px/20px instead. Every element on these screens carries an
// explicit size, so nothing moves today — but the inherited value is what any
// future unsized text would land on, so it is reset here too.
const INHERITED_TYPE = { fontSize: 16, lineHeight: "24px" } as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className="flex min-h-screen w-full overflow-x-hidden bg-white"
            style={{ fontFamily: SYSTEM_FONT_STACK, ...INHERITED_TYPE }}
        >
            <div className="flex w-full items-center justify-center bg-white p-8 sm:p-12 md:w-1/2 md:p-16">
                <div className="flex w-full max-w-[508px] flex-col">{children}</div>
            </div>

            <AuthBrandPanel />
        </div>
    );
}
