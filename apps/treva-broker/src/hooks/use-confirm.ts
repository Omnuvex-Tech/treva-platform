"use client";

import { useCallback, useState } from "react";

export interface UseConfirm<T> {
    /** The item awaiting confirmation, or `null` when the dialog is closed. */
    target: T | null;
    isOpen: boolean;
    /** Opens the dialog for this item. */
    ask: (target: T) => void;
    /** Closes without acting. */
    dismiss: () => void;
}

/**
 * Holds "what am I confirming" for a `ConfirmDialog`.
 *
 * A screen usually has one dialog and many rows, so the open state and the
 * subject are the same piece of information — keeping them as one value makes
 * it impossible to render the dialog without knowing what it acts on.
 *
 * Deliberately not a promise-returning `confirm()` helper: that reads nicely at
 * the call site but hides the dialog outside React's tree, which breaks
 * translations, theming and testing.
 */
export function useConfirm<T>(): UseConfirm<T> {
    const [target, setTarget] = useState<T | null>(null);

    const ask = useCallback((next: T) => setTarget(next), []);
    const dismiss = useCallback(() => setTarget(null), []);

    return { target, isOpen: target !== null, ask, dismiss };
}
