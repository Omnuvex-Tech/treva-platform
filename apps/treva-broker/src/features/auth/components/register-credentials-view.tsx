"use client";

import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { signUpAction, type RegisterFormState } from "../actions";
import type { RegistrationType } from "./register-type-view";

const TOTAL_STEPS = 3;
const STEP = 3;

const initialState: RegisterFormState = { error: null };

export interface RegisterCredentialsViewProps {
    type: RegistrationType;
    onBack: () => void;
}

/**
 * The credentials step of sign-up.
 *
 * The type step's five artboards are the only ones drawn — nothing in the file
 * shows what comes after — so this reuses that card's own chrome (the segmented
 * meter, the title block, the Back / Continue row and the legal footer) and
 * fills the body with the two fields the login screen already asks for. It is
 * deliberately the smallest thing that completes the flow; when the real step
 * is designed, only the body between the header and the actions changes.
 */
export function RegisterCredentialsView({ type, onBack }: RegisterCredentialsViewProps) {
    const { locale, t } = useI18n();
    const copy = t.auth.registerType;
    const credentials = t.auth.registerCredentials;

    const [state, formAction, pending] = useActionState(signUpAction, initialState);

    return (
        <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-12">
            <div
                aria-hidden
                className="pointer-events-none fixed -top-1/3 -left-1/4 -z-10 size-[120vh] rounded-pill bg-bg-secondary/60 blur-3xl"
            />

            <div className="w-full max-w-[540px]">
                <form
                    action={formAction}
                    className="overflow-hidden rounded-lg border border-border-subtle bg-bg-primary shadow-l2"
                >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="type" value={type} />

                    <header className="px-8 pt-8 pb-6">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                                    <span
                                        key={index}
                                        className={cn(
                                            "h-1 rounded-pill transition-all",
                                            index < STEP
                                                ? "w-6 bg-bg-brand"
                                                : "w-4 bg-border-tertiary",
                                        )}
                                    />
                                ))}
                            </div>

                            <p className="pl-1 text-xs text-content-tertiary">
                                {interpolate(copy.step, { current: STEP, total: TOTAL_STEPS })}
                            </p>
                        </div>

                        <h1 className="pt-5 text-2xl font-semibold text-content-primary">
                            {credentials.title}
                        </h1>
                        <p className="pt-1 text-sm text-content-tertiary">
                            {credentials.subtitle}
                        </p>
                    </header>

                    <div className="flex flex-col gap-4 px-8 py-6">
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
                            autoComplete="new-password"
                            required
                            minLength={8}
                            label={t.auth.password}
                            placeholder="••••••••••"
                            hint={credentials.passwordHint}
                            leadingIcon={<Lock />}
                        />

                        {state.error ? (
                            <p role="alert" className="text-sm text-content-negative">
                                {state.error}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 px-8 pt-2 pb-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            leadingIcon={
                                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={1.6} />
                            }
                        >
                            {copy.back}
                        </Button>

                        <Button
                            type="submit"
                            size="lg"
                            loading={pending}
                            className="rounded-pill px-5"
                            trailingIcon={
                                <HugeiconsIcon
                                    icon={ArrowRight02Icon}
                                    size={16}
                                    strokeWidth={1.6}
                                />
                            }
                        >
                            {credentials.submit}
                        </Button>
                    </div>
                </form>

                <p className="pt-6 text-center text-xs text-content-tertiary">
                    {copy.legalPrefix}{" "}
                    <Link href="#" className="font-medium text-content-secondary underline">
                        {copy.terms}
                    </Link>{" "}
                    {copy.legalAnd}{" "}
                    <Link href="#" className="font-medium text-content-secondary underline">
                        {copy.privacy}
                    </Link>
                </p>
            </div>
        </div>
    );
}
