"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LocaleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Swap for the real reporter (Sentry et al.) when one is added — until
        // then the console at least keeps the digest reachable in production.
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-pill bg-bg-negative-subtle text-content-negative">
                <TriangleAlert className="size-5" />
            </span>

            <h1 className="text-2xl font-medium text-content-primary">Something went wrong</h1>
            <p className="max-w-sm text-sm text-content-tertiary">
                An unexpected error interrupted this page.
                {error.digest ? ` Reference: ${error.digest}` : ""}
            </p>

            <Button onClick={reset} className="mt-2">
                Try again
            </Button>
        </div>
    );
}
