"use client";

import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useActionState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
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

            {/* Two 508x52 actions, 12 apart, both on the 3XL radius with a
                16/Medium label (873:59616 / 873:59617). The pair is the whole
                point of the artboard: signing in is the filled brand button,
                registering the outlined one directly under it — same size, so
                neither reads as secondary chrome. */}
            <Button
                type="submit"
                size="lg"
                block
                loading={pending}
                className="h-13 rounded-lg text-base"
            >
                {t.auth.signIn}
            </Button>

            {/* A link, not a button: it navigates rather than submitting, and
                nesting one inside the form's submit would post the credentials
                on the way out. `buttonVariants` keeps it identical to the
                filled action above. */}
            <Link
                href={routes.register(locale)}
                className={cn(
                    buttonVariants({ variant: "brandOutline", size: "lg", block: true }),
                    "h-13 rounded-lg text-base",
                )}
            >
                {t.auth.register}
            </Link>

            <p className="text-center text-xs text-content-tertiary">{t.auth.securityNote}</p>
        </form>
    );
}
