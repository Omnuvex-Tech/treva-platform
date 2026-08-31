import { NextResponse, type NextRequest } from "next/server";

import {
    DEFAULT_LOCALE,
    LOCALE_COOKIE,
    LOCALE_COOKIE_MAX_AGE,
    isLocale,
} from "@/lib/i18n/config";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";
import { isPublicPath } from "@/config/routes";

/**
 * Two jobs, in order:
 *
 *  1. Guarantee every page URL carries a locale prefix (`/news-feed` -> `/en/news-feed`).
 *  2. Bounce anonymous visitors to the login screen, and signed-in visitors
 *     away from it.
 *
 * What it deliberately does NOT do is check permissions. Middleware runs on the
 * Edge runtime and would have to decode (and eventually verify) the session on
 * every asset-adjacent request; permission checks belong in
 * `lib/auth/guard.ts`, on the server, next to the page that needs them.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const [, firstSegment = ""] = pathname.split("/");

    // Presence, not validity: a forged or expired cookie still gets past here
    // and is rejected by getSession() during the render. This check exists only
    // to avoid rendering a dashboard shell for an obviously anonymous visitor.
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

    if (!isLocale(firstSegment)) {
        const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
        const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;
        return NextResponse.redirect(url);
    }

    const pathWithoutLocale = pathname.slice(firstSegment.length + 1) || "/";
    const publicPath = isPublicPath(pathWithoutLocale);

    if (!hasSession && !publicPath) {
        const url = request.nextUrl.clone();
        url.pathname = `/${firstSegment}/login`;
        // Remember where they were headed so login can return them there.
        url.searchParams.set("from", pathWithoutLocale);
        return NextResponse.redirect(url);
    }

    if (hasSession && publicPath) {
        const url = request.nextUrl.clone();
        url.pathname = `/${firstSegment}/news-feed`;
        url.search = "";
        return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
    });

    return response;
}

export const config = {
    // Everything except Next internals, API routes, and files with an extension.
    matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
