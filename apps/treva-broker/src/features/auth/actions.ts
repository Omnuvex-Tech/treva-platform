"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isApiError } from "@/lib/api/errors";
import { SESSION_COOKIE, SESSION_MAX_AGE, encodeSession } from "@/lib/auth/session-cookie";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { HOME_ROUTE, routes } from "@/config/routes";
import { authService } from "./api/auth.service";

export interface LoginFormState {
    error: string | null;
}

/**
 * Handles the login form.
 *
 * A Server Action rather than a client fetch so the session cookie is set with
 * `httpOnly` — a token in a JS-readable cookie is one XSS away from being
 * stolen, and that matters the moment this stops talking to the mock adapter.
 */
export async function signInAction(
    _previousState: LoginFormState,
    formData: FormData,
): Promise<LoginFormState> {
    const localeValue = String(formData.get("locale") ?? "");
    const locale: Locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;

    try {
        // The role is never sent from here — it belongs to the account and is
        // decided server-side, by the API (or by the mock's account table).
        const session = await authService.login({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            rememberMe: formData.get("rememberMe") === "on",
        });

        const store = await cookies();
        store.set(SESSION_COOKIE, encodeSession(session), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: SESSION_MAX_AGE,
        });
    } catch (error) {
        return {
            error: isApiError(error) ? error.message : "Sign in failed. Please try again.",
        };
    }

    // Outside the try/catch on purpose: redirect() signals by throwing, and a
    // catch block would swallow it and report a login failure instead.
    redirect(HOME_ROUTE(locale));
}

export async function signOutAction(locale: Locale): Promise<void> {
    try {
        await authService.logout();
    } catch {
        // A failed server-side revoke must not strand the user in a signed-in
        // UI — the local cookie is cleared either way.
    }

    const store = await cookies();
    store.delete(SESSION_COOKIE);

    redirect(routes.login(isLocale(locale) ? locale : DEFAULT_LOCALE));
}
