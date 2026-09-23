"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isApiError } from "@/lib/api/errors";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    decodeSession,
    encodeSession,
} from "@/lib/auth/session-cookie";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { HOME_ROUTE, routes } from "@/config/routes";
import type { Session } from "@/types/auth";
import { authService } from "./api/auth.service";

/**
 * What a failed auth form gets back. `code` is the API's machine-readable key
 * (`invalid_credentials`, `email_taken`, …) which the form translates; `error`
 * is the raw message, shown only when the code has no translation.
 */
export interface AuthFormState {
    error: string | null;
    code: string | null;
}

export type LoginFormState = AuthFormState;
export type RegisterFormState = AuthFormState;

function failure(error: unknown, fallbackCode: string): AuthFormState {
    return isApiError(error)
        ? { error: error.message, code: error.code }
        : { error: null, code: fallbackCode };
}

function readLocale(formData: FormData): Locale {
    const value = String(formData.get("locale") ?? "");
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

async function storeSession(session: Session) {
    // The cookie never outlives the token inside it.
    const secondsLeft = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);

    const store = await cookies();
    store.set(SESSION_COOKIE, encodeSession(session), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: Math.max(0, Math.min(SESSION_MAX_AGE, secondsLeft || SESSION_MAX_AGE)),
    });
}

/**
 * Handles the login form.
 *
 * A Server Action rather than a client fetch so the session cookie is set with
 * `httpOnly` — the API's access token lives in it, and a token in a JS-readable
 * cookie is one XSS away from being stolen.
 */
export async function signInAction(
    _previousState: LoginFormState,
    formData: FormData,
): Promise<LoginFormState> {
    const locale = readLocale(formData);

    try {
        // The role is never sent from here — it belongs to the account and is
        // decided server-side, by the API (or by the mock's account table).
        const session = await authService.login({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            rememberMe: formData.get("rememberMe") === "on",
        });

        await storeSession(session);
    } catch (error) {
        return failure(error, "signInFailed");
    }

    // Outside the try/catch on purpose: redirect() signals by throwing, and a
    // catch block would swallow it and report a login failure instead.
    redirect(HOME_ROUTE(locale));
}

export async function signOutAction(locale: Locale): Promise<void> {
    const store = await cookies();
    const session = decodeSession(store.get(SESSION_COOKIE)?.value);

    try {
        await authService.logout(session?.accessToken);
    } catch {
        // A failed server-side revoke must not strand the user in a signed-in
        // UI — the local cookie is cleared either way.
    }

    store.delete(SESSION_COOKIE);

    redirect(routes.login(isLocale(locale) ? locale : DEFAULT_LOCALE));
}

/**
 * Handles the sign-up form.
 *
 * The same shape as {@link signInAction}, and for the same reason: the session
 * cookie has to be set `httpOnly`, which only the server can do. A new account
 * is signed in immediately — there is no verification step in the file.
 *
 * Creating a company sends nothing about it but its name; the API creates the
 * company and the account together and makes this user its owner.
 */
export async function signUpAction(
    _previousState: RegisterFormState,
    formData: FormData,
): Promise<RegisterFormState> {
    const locale = readLocale(formData);
    const type = formData.get("type") === "company" ? "company" : "individual";
    const companyName = String(formData.get("companyName") ?? "").trim();

    if (type === "company" && !companyName) {
        return { error: "Company name is required", code: "validation_error" };
    }

    try {
        const session = await authService.register({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            type,
            ...(type === "company" ? { companyName } : {}),
        });

        await storeSession(session);
    } catch (error) {
        return failure(error, "registerFailed");
    }

    // Outside the try/catch: redirect() signals by throwing.
    redirect(HOME_ROUTE(locale));
}
