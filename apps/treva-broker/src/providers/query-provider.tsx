"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { getQueryClient } from "@/lib/query/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
    // useState, not a module constant: on the server this must produce a fresh
    // client per request, and in the browser it must survive re-renders without
    // being recreated. getQueryClient() handles both, useState pins the result.
    const [queryClient] = useState(getQueryClient);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
