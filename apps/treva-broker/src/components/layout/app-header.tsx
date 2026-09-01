"use client";

import { Logout01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Input } from "@/components/ui/input";
import { getPageHeading } from "@/config/page-meta";
import { signOutAction } from "@/features/auth/actions";
import { useI18n } from "@/providers/i18n-provider";
import { Breadcrumbs } from "./breadcrumbs";
import { LanguageSwitcher } from "./language-switcher";
import { ProfileChip } from "./profile-chip";

/**
 * The 80px bar to the right of the logo cell: the page heading on the left,
 * global search and the three action chips on the right. The sidebar collapse
 * lives on the sidebar's own edge chevron — the third chip here is sign-out,
 * per the prototype (873:49336).
 *
 * The heading is either a Title + Subtitle block (873:48482) or a Breadcrumbs
 * row (873:51699); which one it is belongs to the route, not to this bar.
 */
export function AppHeader() {
    const pathname = usePathname();
    const { t, locale } = useI18n();
    const [signingOut, startSignOut] = useTransition();
    const heading = getPageHeading(pathname, t, locale);

    return (
        <header className="flex h-full items-center justify-between gap-6 bg-bg-app px-8">
            {heading.kind === "breadcrumbs" ? (
                <Breadcrumbs trail={heading.trail} />
            ) : (
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-medium text-content-primary">
                        {heading.title}
                    </h1>
                    {heading.subtitle ? (
                        <p className="truncate text-sm text-content-tertiary">{heading.subtitle}</p>
                    ) : null}
                </div>
            )}

            <div className="flex shrink-0 items-center gap-2">
                <Input
                    type="search"
                    placeholder={t.common.search}
                    aria-label={t.common.search}
                    leadingIcon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />}
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
                        className="flex size-11 items-center justify-center rounded-md bg-bg-tertiary text-content-secondary transition-colors hover:bg-border-tertiary disabled:opacity-60"
                    >
                        <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.6} />
                    </button>
                </form>
            </div>
        </header>
    );
}
