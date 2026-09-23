"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { signInAction, type LoginFormState } from "../actions";
import { authErrorMessage } from "../error-message";

const initialState: LoginFormState = { error: null, code: null };

// inventory sets its border colour via an inline style, which beats any
// Tailwind class in specificity — so its own `focus:border-[#CBD5E1]` never
// actually renders and the border stays #EBEBEB at every state. Matching that
// rendered behaviour (not the dead class) means never writing that variant
// here either — only the background actually changes on focus.
const inputClass =
    "h-[52px] w-full rounded-[16px] border border-[#EBEBEB] bg-[#F4F5F5] py-4 pl-[44px] text-[#666666] placeholder-[#666666] outline-none transition-all focus:bg-white";

const labelClass = "mb-0.5 block text-[#333333]";

/**
 * Sign-in, a 1:1 visual copy of the treva-inventory login form (same field
 * layout, icons, spacing, colours, radii) plus a Register action beneath the
 * submit button. Content is TREVA Broker's own — pulled from the i18n
 * dictionary, never hardcoded — everything else matches inventory exactly.
 */
export function LoginForm() {
    const { locale, t } = useI18n();
    const [state, formAction, pending] = useActionState(signInAction, initialState);
    const errorMessage = authErrorMessage(t, state, "signInFailed");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    // Controlled on purpose: React resets uncontrolled fields after every form
    // action, which would wipe what was typed whenever sign-in fails.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <>
            <header className="mb-9 text-center">
                <h1 className="mb-2 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>
                    {t.auth.welcomeTitle}
                </h1>
                <p className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
                    {t.auth.welcomeSubtitle}
                </p>
            </header>

            <form action={formAction} className="flex flex-col gap-5">
                <input type="hidden" name="locale" value={locale} />

                {errorMessage ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="flex flex-col gap-2">
                    <label htmlFor="login-email" className={labelClass} style={{ fontWeight: 600, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                        {t.auth.email}
                    </label>
                    <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-4 flex h-5 w-5 items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static 19px icon copied from inventory */}
                            <img src="/images/pages/login/mail.svg" alt="" width={19} height={17} />
                        </span>
                        <input
                            id="login-email"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            autoComplete="email"
                            placeholder={t.auth.emailPlaceholder}
                            className={`${inputClass} pr-3`}
                            style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="login-password" className={labelClass} style={{ fontWeight: 600, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                        {t.auth.password}
                    </label>
                    <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-4 flex h-5 w-5 items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static 15px icon copied from inventory */}
                            <img src="/images/pages/login/lock.svg" alt="" width={15} height={19} />
                        </span>
                        <input
                            id="login-password"
                            name="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            className={`${inputClass} pr-12`}
                            style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 flex h-5 w-5 items-center justify-center text-[#666666] transition-colors hover:text-[#1A1A1A]"
                        >
                            {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between" style={{ paddingTop: "calc(var(--spacing) * 8)" }}>
                    <label className="flex cursor-pointer items-center gap-2 text-[#333333] select-none" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="sr-only"
                        />
                        {rememberMe ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#4E525D]">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- static 20px icon copied from inventory
                            <img src="/images/pages/login/checkbox.svg" alt="" width={20} height={20} />
                        )}
                        {t.auth.rememberMe}
                    </label>
                    <Link
                        href={routes.forgotPassword(locale)}
                        className="text-[#1A1A1A] transition-all hover:underline"
                        style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0, textAlign: "center" }}
                    >
                        {t.auth.forgotPassword}
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={pending}
                    className="mt-3 flex h-[52px] w-full items-center justify-center rounded-[16px] border border-white text-white transition-colors hover:bg-[#3F4452] disabled:opacity-50"
                    style={{ background: "#4E525D", fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}
                >
                    {pending ? t.auth.signingIn : t.auth.signIn}
                </button>

                {/* A link, not a button: it navigates rather than submitting the
                    credentials. Same box as the submit, outlined instead of filled. */}
                <Link
                    href={routes.register(locale)}
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-[#4E525D] bg-white text-[#4E525D] transition-colors hover:bg-[#F4F5F5]"
                    style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}
                >
                    {t.auth.register}
                </Link>
            </form>

            <footer className="mt-6 text-center">
                <p className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>
                    {t.auth.securityNote}
                </p>
            </footer>
        </>
    );
}
