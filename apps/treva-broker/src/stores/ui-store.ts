import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
    /** The design has a collapse chevron on the sidebar edge (`Btn-collapse`). */
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * Purely presentational, per-browser state. Anything that belongs to the user
 * or the business lives in TanStack Query (server state) or the session cookie —
 * not here.
 */
export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        }),
        {
            name: "treva-broker-ui",
            /**
             * Without this, zustand reads localStorage while the store module is
             * evaluated — so the first client render can disagree with the
             * server HTML (collapsed vs expanded) and React reports a hydration
             * mismatch. `StoreHydration` re-applies the stored value in an
             * effect instead, after hydration has settled.
             */
            skipHydration: true,
            // Only the collapse flag is worth persisting; adding more state here
            // later means bumping `version` and writing a migrate().
            partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
        },
    ),
);
