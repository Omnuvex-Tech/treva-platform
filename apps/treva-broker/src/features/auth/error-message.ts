import type { Dictionary } from "@/lib/i18n/types";
import type { AuthFormState } from "./actions";

type ErrorKey = keyof Dictionary["auth"]["errors"];

/**
 * The text an auth form shows for a failed submit: the translation for the
 * API's error code when there is one, else the API's own message, else the
 * form's generic failure line.
 */
export function authErrorMessage(
    t: Dictionary,
    state: AuthFormState,
    fallback: "signInFailed" | "registerFailed",
): string | null {
    if (!state.error && !state.code) return null;

    const errors = t.auth.errors;
    if (state.code && state.code in errors) {
        return errors[state.code as ErrorKey];
    }

    return state.error ?? errors[fallback];
}
