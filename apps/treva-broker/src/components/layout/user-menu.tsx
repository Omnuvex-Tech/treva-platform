"use client";

import { LogOut, UserRound } from "lucide-react";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { useSession } from "@/providers/session-provider";
import { useI18n } from "@/providers/i18n-provider";
import { signOutAction } from "@/features/auth/actions";

export function UserMenu() {
    const { user } = useSession();
    const { t, locale } = useI18n();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={user.fullName}
                className="flex size-11 items-center justify-center rounded-md bg-bg-secondary text-content-secondary transition-colors hover:bg-bg-tertiary"
            >
                <UserRound className="size-4" />
            </button>

            {open ? (
                <>
                    <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setOpen(false)}
                    />

                    <div
                        role="menu"
                        className="absolute top-full right-0 z-20 mt-1 w-60 overflow-hidden rounded-md border border-border-subtle bg-bg-primary shadow-l7"
                    >
                        <div className="flex items-center gap-3 border-b border-border-subtle px-3 py-3">
                            <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-content-primary">
                                    {user.fullName}
                                </p>
                                <p className="truncate text-xs text-content-tertiary">
                                    {ROLE_LABELS[user.role]}
                                </p>
                            </div>
                        </div>

                        <form
                            action={() => {
                                startTransition(async () => {
                                    await signOutAction(locale);
                                });
                            }}
                        >
                            <button
                                type="submit"
                                role="menuitem"
                                disabled={pending}
                                className={cn(
                                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-content-secondary transition-colors",
                                    "hover:bg-bg-secondary hover:text-content-primary disabled:opacity-60",
                                )}
                            >
                                <LogOut className="size-4" />
                                {t.common.signOut}
                            </button>
                        </form>
                    </div>
                </>
            ) : null}
        </div>
    );
}
