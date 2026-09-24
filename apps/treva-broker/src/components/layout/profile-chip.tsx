"use client";

import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { AssetIcon } from "@/components/ui/asset-icon";
import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";

/**
 * The 44px `Button` every header chip is drawn with (905:13550-52):
 * Background/Teritary inside a 1px white edge on the 3XL radius, 14px side
 * padding (13 + the border here — Figma strokes sit inside the frame), ink on
 * Content/Brand. Shared with the language and sign-out chips.
 */
export const headerChipClass =
    "flex h-11 min-w-11 items-center justify-center rounded-lg border border-border-inverse bg-bg-tertiary px-[13px] text-content-brand transition-colors hover:bg-border-tertiary disabled:opacity-60";

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
            className={cn(headerChipClass, "w-11 px-0")}
        >
            <AssetIcon src="/images/layout/icon-user.svg" size={16} />
        </Link>
    );
}
