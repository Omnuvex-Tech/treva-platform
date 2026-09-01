"use client";

import { User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useSession } from "@/providers/session-provider";

/**
 * The profile chip in the app header.
 *
 * Deliberately NOT a dropdown — the prototype opens no menu from it. Sign-out
 * is its own chip beside this one, so there is nothing left for a menu to hold.
 * It carries the signed-in user's name as its accessible label and tooltip.
 *
 * Its destination is not settled: the prototype has no profile screen behind
 * it. Left inert rather than pointed at an invented route.
 */
export function ProfileChip() {
    const { user } = useSession();

    return (
        <button
            type="button"
            aria-label={user.fullName}
            title={user.fullName}
            className="flex size-11 items-center justify-center rounded-md bg-bg-tertiary text-content-secondary transition-colors hover:bg-border-tertiary"
        >
            <HugeiconsIcon icon={User02Icon} size={18} strokeWidth={1.6} />
        </button>
    );
}
