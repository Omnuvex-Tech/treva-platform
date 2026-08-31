"use client";

import { useI18n } from "@/providers/i18n-provider";
import { Logo } from "./logo";

/**
 * The 280x80 cell above the sidebar. In the collapsed-sidebar artboard
 * (873:48750) this cell keeps its 280px width and full wordmark — only the
 * rail below it narrows to 76px, so the header still starts at x=280.
 */
export function LogoCell() {
    const { locale } = useI18n();

    return (
        <div className="flex h-full w-sidebar shrink-0 items-center px-8">
            <Logo locale={locale} />
        </div>
    );
}
