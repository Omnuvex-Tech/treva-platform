"use client";

import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { signInAction, type LoginFormState } from "../actions";

const initialState: LoginFormState = { error: null };

export function LoginForm() {
    const { locale, t } = useI18n();
    const [state, formAction, pending] = useActionState(signInAction, initialState);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <div>
                <h1 className="text-3xl font-medium text-content-primary">{t.auth.welcomeTitle}</h1>
                <p className="mt-1 text-sm text-content-tertiary">{t.auth.welcomeSubtitle}</p>
            </div>

            <input type="hidden" name="locale" value={locale} />

            <div className="flex flex-col gap-4">
                <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    label={t.auth.email}
                    placeholder={t.auth.emailPlaceholder}
                    leadingIcon={<Mail />}
                />

                <Input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    label={t.auth.password}
                    placeholder="••••••••••"
                    leadingIcon={<Lock />}
                />
            </div>

            <div className="flex items-center justify-between gap-3">
                <Checkbox name="rememberMe" label={t.auth.rememberMe} />
                <Link
                    href={routes.forgotPassword(locale)}
                    className="text-xs font-medium text-content-secondary hover:text-content-primary"
                >
                    {t.auth.forgotPassword}
                </Link>
            </div>

            {state.error ? (
                <p role="alert" className="text-sm text-content-negative">
                    {state.error}
                </p>
            ) : null}

            {/* 52px tall and full width, as in the artboard. Note the design
                shows a *second* 508x52 button under this one whose label is not
                in the file (it lives inside a component instance) — likely an
                SSO option. Left out rather than guessed at. */}
            <Button type="submit" size="lg" block loading={pending} className="h-13">
                {t.auth.signIn}
            </Button>

            <p className="text-center text-xs text-content-tertiary">{t.auth.securityNote}</p>
        </form>
    );
}
