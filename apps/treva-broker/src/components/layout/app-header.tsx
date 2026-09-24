"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Input } from "@/components/ui/input";
import { getPageHeading } from "@/config/page-meta";
import { signOutAction } from "@/features/auth/actions";
import { useI18n } from "@/providers/i18n-provider";
import { Breadcrumbs } from "./breadcrumbs";
import { LanguageSwitcher } from "./language-switcher";
import { ProfileChip, headerChipClass } from "./profile-chip";

/**
 * The 80px `AppHeader` to the right of the logo cell (873:49164): the page
 * heading on the left, and on the right a 280px search field and the three
 * 44px chips, 8px apart. The sidebar collapse lives on the sidebar's own edge
 * chevron — the third chip here is sign-out.
 *
 * The heading is either a Title + Subtitle block (24/Medium over 14/Regular)
 * or a Breadcrumbs row (873:51699); which one it is belongs to the route, not
 * to this bar. A second-level screen draws the trail alone: the article
 * detail (873:51697), Add news (873:51432) and a client (873:49407) have no
 * search field and no chips, so those only come with a title.
 */
export function AppHeader() {
    const pathname = usePathname();
    const { t, locale } = useI18n();
    const [signingOut, startSignOut] = useTransition();
    const heading = getPageHeading(pathname, t, locale);

    if (heading.kind === "breadcrumbs") {
        return (
            <header className="flex h-full items-center bg-bg-app px-8">
                <Breadcrumbs trail={heading.trail} />
            </header>
        );
    }

    return (
        <header className="flex h-full items-center justify-between gap-6 bg-bg-app px-8">
            <div className="min-w-0">
                <h1 className="truncate text-2xl font-medium text-content-primary">{heading.title}</h1>
                {heading.subtitle ? (
                    <p className="truncate text-sm text-content-tertiary">{heading.subtitle}</p>
                ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Input
                    type="search"
                    placeholder={t.common.search}
                    aria-label={t.common.search}
                    // The glyph sits 16px in: 1 of border, 12 of padding, 3 here.
                    leadingIcon={
                        <AssetIcon
                            src="/images/layout/icon-search.svg"
                            size={20}
                            className="ml-[3px] text-content-brand"
                        />
                    }
                    surface="outlined"
                    containerClassName="w-70"
                />

                <LanguageSwitcher />
                <ProfileChip />

                <form action={() => startSignOut(() => signOutAction(locale))}>
                    <button
                        type="submit"
                        disabled={signingOut}
                        aria-label={t.common.signOut}
                        title={t.common.signOut}
                        className={cn(headerChipClass, "w-11 px-0")}
                    >
                        <AssetIcon src="/images/layout/icon-logout.svg" size={16} />
                    </button>
                </form>
            </div>
        </header>
    );
}
