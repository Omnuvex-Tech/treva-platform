"use client";

import { useI18n } from "@/providers/i18n-provider";
import { Logo } from "./logo";

/**
 * The 280x80 cell above the sidebar (873:49162): white, closed by a 1px
 * Border/Subtle rule on the right (the bottom one is the header row's), with
 * the wordmark 32px in and 20px down.
 *
 * It deliberately does NOT track the rail width. In the collapsed-sidebar
 * artboard (873:48750) the whole top row is unchanged — `Logo > Container` is
 * still 280x80 and the header beside it is still 1160 wide. Only the rail below
 * narrows, to 76, and the content area grows to 1364.
 */
export function LogoCell() {
    const { locale } = useI18n();

    return (
        <div className="flex h-full w-sidebar shrink-0 items-start border-r border-border-subtle bg-bg-primary pt-5 pr-[33px] pl-8">
            <Logo locale={locale} />
        </div>
    );
}
