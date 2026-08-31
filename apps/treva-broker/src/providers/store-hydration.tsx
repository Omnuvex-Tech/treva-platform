"use client";

import { useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

/**
 * Applies persisted UI preferences after hydration.
 *
 * Pairs with `skipHydration: true` in the store — see the note there for why
 * reading localStorage any earlier breaks hydration.
 */
export function StoreHydration() {
    useEffect(() => {
        void useUiStore.persist.rehydrate();
    }, []);

    return null;
}
