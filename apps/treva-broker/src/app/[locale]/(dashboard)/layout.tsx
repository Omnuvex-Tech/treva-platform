import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { LogoCell } from "@/components/layout/logo-cell";
import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/lib/auth/guard";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { SessionProvider } from "@/providers/session-provider";
import { StoreHydration } from "@/providers/store-hydration";

/**
 * The shell shared by all three roles: an 80px top row (logo cell + header)
 * over a sidebar + scrollable content row. Matches the frame structure of every
 * artboard in the Figma file, where `Logo` is 1440x80 and `body` is 1440x944.
 */
export default async function DashboardLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    // Server-side gate. The middleware already redirects anonymous visitors;
    // this is what actually reads and validates the session, and it is the only
    // place the user object enters the tree.
    const session = await requireSession(locale);

    return (
        <SessionProvider user={session.user}>
            <StoreHydration />
            <div className="flex h-dvh flex-col overflow-hidden">
                <div className="flex h-header shrink-0">
                    <LogoCell />
                    <div className="min-w-0 flex-1">
                        <AppHeader />
                    </div>
                </div>

                <div className="flex min-h-0 flex-1">
                    <Sidebar />
                    <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </SessionProvider>
    );
}
