"use client";

import { useEffect } from "react";

export function DevBfCacheReload() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    return null;
}
