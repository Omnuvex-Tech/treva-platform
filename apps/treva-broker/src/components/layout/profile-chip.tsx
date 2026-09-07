"use client";

import { User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";

/**
 * The profile chip in the app header.
 *
 * Deliberately NOT a dropdown — the prototype opens no menu from it. Sign-out
 * is its own chip beside this one, so there is nothing left for a menu to hold.
 * It carries the signed-in user's name as its accessible label and tooltip, and
 * goes to the Profile card (873:48750), the one screen in the file that shows
 * the account's own details.
 */
export function ProfileChip() {
    const { locale } = useI18n();
    const { user } = useSession();

    return (
        <Link
            href={routes.adminUserProfile(locale)}
            aria-label={user.fullName}
            title={user.fullName}
            className="flex size-11 items-center justify-center rounded-md bg-bg-tertiary text-content-secondary transition-colors hover:bg-border-tertiary"
        >
            <HugeiconsIcon icon={User02Icon} size={18} strokeWidth={1.6} />
        </Link>
    );
}
