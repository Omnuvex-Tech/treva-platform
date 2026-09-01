import { QueryClient, isServer } from "@tanstack/react-query";

import { isApiError } from "@/lib/api/errors";

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Long enough that navigating back to a list does not refetch,
                // short enough that a CRM user is not looking at yesterday.
                staleTime: 60_000,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    // 401/403/404 will not become successes by asking again —
                    // retrying them only delays the error UI by seconds.
                    if (isApiError(error) && error.status >= 400 && error.status < 500) {
                        return false;
                    }
                    return failureCount < 2;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client per request on the server, one shared client in the browser.
 *
 * Reusing a single module-level client on the server would leak one user's
 * cached data into another user's render — the classic App Router footgun.
 */
export function getQueryClient(): QueryClient {
    if (isServer) {
        return makeQueryClient();
    }

    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
}
