"use client";

import { LogOut, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Input } from "@/components/ui/input";
import { getPageMeta } from "@/config/page-meta";
import { signOutAction } from "@/features/auth/actions";
import { useI18n } from "@/providers/i18n-provider";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";

/**
 * The 80px bar to the right of the logo cell: page title + subtitle on the
 * left, global search and the three action chips on the right. The sidebar
 * collapse lives on the sidebar's own edge chevron — the third chip here is
 * sign-out, per the prototype (873:49336).
 */
export function AppHeader() {
    const pathname = usePathname();
    const { t, locale } = useI18n();
    const [signingOut, startSignOut] = useTransition();
    const { title, subtitle } = getPageMeta(pathname, t);

    return (
        <header className="flex h-full items-center justify-between gap-6 border-b border-border-subtle px-8">
            <div className="min-w-0">
                <h1 className="truncate text-2xl font-medium text-content-primary">{title}</h1>
                {subtitle ? (
                    <p className="truncate text-sm text-content-tertiary">{subtitle}</p>
                ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Input
                    type="search"
                    placeholder={t.common.search}
                    aria-label={t.common.search}
                    leadingIcon={<Search />}
                    containerClassName="w-70"
                />

                <LanguageSwitcher />
                <UserMenu />

                <form action={() => startSignOut(() => signOutAction(locale))}>
                    <button
                        type="submit"
                        disabled={signingOut}
                        aria-label={t.common.signOut}
                        title={t.common.signOut}
                        className="flex size-11 items-center justify-center rounded-md bg-bg-secondary text-content-secondary transition-colors hover:bg-bg-tertiary disabled:opacity-60"
                    >
                        <LogOut className="size-4" />
                    </button>
                </form>
            </div>
        </header>
    );
}
