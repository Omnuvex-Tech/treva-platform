"use client";

import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Lock, Mail, Phone } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { signUpAction, type RegisterFormState } from "../actions";
import { authErrorMessage } from "../error-message";
import type { RegistrationType } from "./register-type-view";

const initialState: RegisterFormState = { error: null, code: null };

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    /** Required: the platform and Bitrix24 both identify a broker by it. */
    phone: string;
    email: string;
    password: string;
}

export interface RegisterCredentialsViewProps {
    type: RegistrationType;
    /** The name typed on the type step when creating a company. */
    companyName?: string;
    credentials: RegisterCredentials;
    onCredentialsChange: (next: RegisterCredentials) => void;
    onBack: () => void;
}

/**
 * The credentials step of sign-up.
 *
 * The type step's five artboards are the only ones drawn — nothing in the file
 * shows what comes after — so this reuses that card's own chrome (the segmented
 * meter, the title block, the Back / Continue row and the legal footer, the
 * last two of which now come from `RegisterShell`) and fills the body with the
 * broker's name, surname and phone above the two fields the login screen
 * already asks for. The phone is required: a number another account already
 * uses is refused, and it is how the broker is matched in Bitrix24. When the
 * real step is designed, only the body between the header and the actions
 * changes.
 */
export function RegisterCredentialsView({
    type,
    companyName,
    credentials,
    onCredentialsChange,
    onBack,
}: RegisterCredentialsViewProps) {
    const { locale, t } = useI18n();
    const copy = t.auth.registerType;
    const copyCredentials = t.auth.registerCredentials;
    const { firstName, lastName, phone, email, password } = credentials;
    const update = (patch: Partial<RegisterCredentials>) =>
        onCredentialsChange({ ...credentials, ...patch });

    const [state, formAction, pending] = useActionState(signUpAction, initialState);
    const errorMessage = authErrorMessage(t, state, "registerFailed");
    // The fields are controlled on purpose: React resets uncontrolled fields
    // after every form action, which would wipe what was typed whenever
    // sign-up fails. The values live in RegisterView so Back keeps them too.

    // Mirrors register-type-view's own count: Individual never opens the
    // company-setup step, so its flow is 2 steps total, not 3 — this is
    // always the last one of whichever it is.
    const totalSteps = type === "company" ? 3 : 2;
    const step = totalSteps;

    return (
        <form action={formAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="type" value={type} />
            {companyName ? <input type="hidden" name="companyName" value={companyName} /> : null}

            <header className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalSteps }, (_, index) => (
                            <span
                                key={index}
                                className={cn(
                                    "h-1 rounded-pill transition-all",
                                    index < step ? "w-6 bg-bg-brand" : "w-4 bg-border-tertiary",
                                )}
                            />
                        ))}
                    </div>

                    <p className="pl-1 text-xs text-content-tertiary">
                        {interpolate(copy.step, { current: step, total: totalSteps })}
                    </p>
                </div>

                <h1 className="pt-5 text-2xl font-semibold text-content-primary">
                    {copyCredentials.title}
                </h1>
                <p className="pt-1 text-sm text-content-tertiary">{copyCredentials.subtitle}</p>
            </header>

            <div className="flex flex-col gap-4 px-8 py-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        name="firstName"
                        value={firstName}
                        onChange={(event) => update({ firstName: event.target.value })}
                        autoComplete="given-name"
                        required
                        label={copyCredentials.firstName}
                    />

                    <Input
                        name="lastName"
                        value={lastName}
                        onChange={(event) => update({ lastName: event.target.value })}
                        autoComplete="family-name"
                        required
                        label={copyCredentials.lastName}
                    />
                </div>

                <Input
                    name="phone"
                    value={phone}
                    onChange={(event) => update({ phone: event.target.value })}
                    type="tel"
                    autoComplete="tel"
                    required
                    label={copyCredentials.phone}
                    placeholder="+994"
                    leadingIcon={<Phone />}
                />

                <Input
                    name="email"
                    value={email}
                    onChange={(event) => update({ email: event.target.value })}
                    type="email"
                    autoComplete="email"
                    required
                    label={t.auth.email}
                    placeholder={t.auth.emailPlaceholder}
                    leadingIcon={<Mail />}
                />

                <Input
                    name="password"
                    value={password}
                    onChange={(event) => update({ password: event.target.value })}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    label={t.auth.password}
                    placeholder="••••••••••"
                    hint={copyCredentials.passwordHint}
                    leadingIcon={<Lock />}
                />

                {errorMessage ? (
                    <p role="alert" className="text-sm text-content-negative">
                        {errorMessage}
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
                        <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.6} />
                    }
                >
                    {copyCredentials.submit}
                </Button>
            </div>
        </form>
    );
}
