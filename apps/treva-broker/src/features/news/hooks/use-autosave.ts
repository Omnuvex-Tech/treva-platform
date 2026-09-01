"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved";

export interface UseAutosaveOptions<T> {
    value: T;
    /** Persists the draft. Errors are swallowed — autosave must never interrupt typing. */
    save: (value: T) => Promise<unknown>;
    delayMs?: number;
    enabled?: boolean;
}

/**
 * Debounced draft autosave, behind the "Auto-saved as draft" indicator in the
 * editor header.
 *
 * Two details that matter: the first render never saves (opening a post is not
 * an edit), and a save in flight does not block the next one from being
 * scheduled — the last write wins, which is the right semantics for a draft.
 */
export function useAutosave<T>({
    value,
    save,
    delayMs = 1200,
    enabled = true,
}: UseAutosaveOptions<T>): { state: AutosaveState; savedAt: Date | null } {
    const [state, setState] = useState<AutosaveState>("idle");
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    /**
     * The value as it was at mount. Comparing by reference is exactly right
     * here: the caller rebuilds the object on every edit, so it only matches
     * while nothing has been touched.
     *
     * A plain "skip the first run" flag looks equivalent and is not — with
     * `enabled` starting false (no title yet), the flag would be spent on the
     * user's very first keystroke and that edit would never be saved.
     */
    const initialValue = useRef(value);
    // Held in a ref so changing the callback identity does not reschedule.
    const saveRef = useRef(save);
    saveRef.current = save;

    useEffect(() => {
        if (!enabled) return;
        if (value === initialValue.current) return;

        setState("saving");
        const timer = setTimeout(() => {
            void saveRef
                .current(value)
                .then(() => {
                    setState("saved");
                    setSavedAt(new Date());
                })
                .catch(() => {
                    // Leave the indicator on "saving" rather than claiming a save
                    // that did not happen; the explicit Save button is the escape.
                    setState("idle");
                });
        }, delayMs);

        return () => clearTimeout(timer);
    }, [value, delayMs, enabled]);

    return { state, savedAt };
}
